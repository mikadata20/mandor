import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, CheckCircle2, XCircle, AlertTriangle, 
  ArrowLeft, ArrowRight, ShieldAlert, Wrench, CheckSquare, 
  Clock, User, MapPin, QrCode, Scan, MessageSquare, Check, X,
  ExternalLink, Layers
} from 'lucide-react';
import { digitalWiDB } from '../../utils/digitalWiDB';
import toast from 'react-hot-toast';

export default function DigitalWiOperatorRuntime() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const stationFromQuery = searchParams.get('station') || 'Station-ASSY-01';
  const operatorName = 'Operator Agus S. (OP-04)';

  const [wi, setWi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Execution State
  const [workOrderId, setWorkOrderId] = useState('WO-2026-1044');
  const [serialNumber, setSerialNumber] = useState('HC-SN-99210');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Operator Recorded Values map: { [stepIndex]: { [checkpointId]: { value, status, notes } } }
  const [checkpointValues, setCheckpointValues] = useState({});
  const [generalNotes, setGeneralNotes] = useState('');
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [savedExecutionResult, setSavedExecutionResult] = useState(null);

  // Load WI
  useEffect(() => {
    loadWiData();
  }, [id]);

  const loadWiData = async () => {
    setLoading(true);
    try {
      const data = await digitalWiDB.getWorkInstructionById(id);
      if (data) {
        setWi(data);
        setSessionStartTime(new Date().toISOString());
      } else {
        toast.error('Instruksi kerja tidak ditemukan');
        navigate('/digital-wi/library');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat WI Operator');
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isCompletedModalOpen) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompletedModalOpen]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading || !wi) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading Work Instruction Kiosk...</p>
        </div>
      </div>
    );
  }

  const currentStep = wi.steps?.[currentStepIndex] || {};
  const totalSteps = wi.steps?.length || 1;
  const currentStepRecorded = checkpointValues[currentStepIndex] || {};

  // Update a single checkpoint's value
  const setStepCheckpointValue = (cpId, value, status = 'PASS', notes = '') => {
    setCheckpointValues(prev => ({
      ...prev,
      [currentStepIndex]: {
        ...(prev[currentStepIndex] || {}),
        [cpId]: { value, status, notes }
      }
    }));
  };

  // Validation: Check if current step's mandatory checkpoints are satisfied
  const validateCurrentStep = () => {
    const checkpoints = currentStep.checkpoints || [];
    for (const cp of checkpoints) {
      if (!cp.required) continue;
      const recorded = currentStepRecorded[cp.id];

      if (!recorded || recorded.value === undefined || recorded.value === '' || recorded.value === null) {
        return { valid: false, message: `Harap selesaikan checkpoint: "${cp.label}"` };
      }

      if (cp.type === 'checklist' && recorded.value !== true) {
        return { valid: false, message: `Konfirmasi checklist "${cp.label}" harus dicentang` };
      }

      if (cp.type === 'numeric') {
        const numVal = parseFloat(recorded.value);
        if (isNaN(numVal)) {
          return { valid: false, message: `Nilai numerik untuk "${cp.label}" belum diisi` };
        }
        if (cp.min !== undefined && numVal < cp.min) {
          return { valid: false, message: `Nilai "${cp.label}" (${numVal} ${cp.unit}) di bawah toleransi minimum (${cp.min} ${cp.unit})` };
        }
        if (cp.max !== undefined && numVal > cp.max) {
          return { valid: false, message: `Nilai "${cp.label}" (${numVal} ${cp.unit}) di atas toleransi maksimum (${cp.max} ${cp.unit})` };
        }
      }

      if (cp.type === 'ok_ng' && recorded.value === 'NG' && !recorded.notes) {
        return { valid: false, message: `Untuk hasil NG pada "${cp.label}", catatan defect wajib diisi` };
      }
    }
    return { valid: true };
  };

  const handleNextStep = () => {
    const val = validateCurrentStep();
    if (!val.valid) {
      toast.error(val.message);
      return;
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Completed all steps
      handleFinishExecution();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Complete and save execution
  const handleFinishExecution = async () => {
    // Check if any step had NG result
    let hasFail = false;
    let defectNotesAccumulator = [];

    const formattedStepResults = (wi.steps || []).map((step, idx) => {
      const recorded = checkpointValues[idx] || {};
      const cpResults = (step.checkpoints || []).map(cp => {
        const r = recorded[cp.id] || { value: 'N/A', status: 'PASS' };
        if (r.value === 'NG' || r.status === 'FAIL') {
          hasFail = true;
          if (r.notes) defectNotesAccumulator.push(`${step.title}: ${r.notes}`);
        }
        return { id: cp.id, label: cp.label, value: r.value, status: r.status };
      });
      return { step_number: step.step_number, checkpoints: cpResults };
    });

    const executionRecord = {
      wi_id: wi.id,
      doc_number: wi.doc_number,
      title: wi.title,
      revision: wi.current_revision,
      station_id: stationFromQuery,
      work_order_id: workOrderId,
      serial_number: serialNumber,
      part_number: wi.part_number,
      operator_name: operatorName,
      status: 'Completed',
      start_time: sessionStartTime,
      completion_time: new Date().toISOString(),
      duration_seconds: elapsedSeconds,
      overall_quality: hasFail ? 'FAIL' : 'PASS',
      defect_notes: defectNotesAccumulator.join('; ') || generalNotes || '',
      step_results: formattedStepResults
    };

    try {
      const saved = await digitalWiDB.saveExecution(executionRecord);
      setSavedExecutionResult(saved);
      setIsCompletedModalOpen(true);
      toast.success('Pengerjaan selesai dan data inspeksi tersimpan!');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan hasil eksekusi: ' + e.message);
    }
  };

  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Touch Kiosk Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/digital-wi"
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={14} /> Exit Kiosk
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {wi.doc_number}
              </span>
              <span className="font-mono text-xs text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                {wi.current_revision}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <MapPin size={12} className="text-purple-400" /> {stationFromQuery}
              </span>
            </div>
            <h1 className="text-base md:text-lg font-bold text-white mt-0.5 truncate max-w-xl">
              {wi.title}
            </h1>
          </div>
        </div>

        {/* Work Order, Serial, and Cycle Timer */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:block bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80">
            <span className="text-slate-400">WO:</span> <span className="font-mono font-bold text-slate-200">{workOrderId}</span>
          </div>

          <div className="hidden sm:block bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80">
            <span className="text-slate-400">SN:</span> <span className="font-mono font-bold text-emerald-400">{serialNumber}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700 font-mono font-bold text-sm text-teal-400 shadow-inner">
            <Clock size={16} />
            {formatTimer(elapsedSeconds)}
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="ml-1 text-slate-400 hover:text-white"
              title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* Progress Strip */}
      <div className="w-full bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-emerald-400 font-mono text-sm">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300 font-medium truncate max-w-md">
            {currentStep.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-400">{progressPercent}% Completed</span>
          <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Touch Operation Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 p-6 gap-6 overflow-y-auto">
        {/* Left: Diagram & Visual Reference (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span>Visual Guide & SOP Reference</span>
              <span className="text-slate-500 font-mono">Page {currentStep.source_pages?.[0] || 1}</span>
            </div>

            {/* Diagram Display */}
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center relative shadow-inner">
              {currentStep.images?.[0] ? (
                <img 
                  src={currentStep.images[0]} 
                  alt="Step Visual" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-500 text-xs p-6 space-y-1">
                  <Layers size={28} className="mx-auto text-slate-600" />
                  <p>Standard Assembly Drawing</p>
                </div>
              )}
            </div>

            {/* Safety Alerts */}
            {currentStep.safety_warnings?.length > 0 && (
              <div className="mt-4 bg-amber-950/40 border border-amber-800/80 rounded-xl p-3.5 space-y-1 text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldAlert size={16} /> Critical Safety Precautions:
                </span>
                <ul className="list-disc list-inside text-amber-200/90 space-y-1 pl-1">
                  {currentStep.safety_warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tools & Materials Badges */}
            {currentStep.tools?.length > 0 && (
              <div className="mt-4 space-y-1 text-xs">
                <span className="font-bold text-slate-400 flex items-center gap-1">
                  <Wrench size={13} /> Required Tools:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentStep.tools.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-md border border-slate-700 text-xs font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800 flex items-center justify-between font-mono">
            <span>Operator: {operatorName}</span>
            <span>Target: {currentStep.cycle_time_target_sec || 60}s</span>
          </div>
        </div>

        {/* Right: Large Step Instruction & Mandatory Checkpoints (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-5">
            {/* Step Heading */}
            <div>
              <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded">
                OPERATIONAL STEP {currentStepIndex + 1}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-white mt-2 leading-snug">
                {currentStep.title}
              </h2>
            </div>

            {/* Detailed Instructions - Large touch text */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-inner">
              <p className="text-base md:text-lg text-slate-200 leading-relaxed font-medium">
                {currentStep.instruction}
              </p>
            </div>

            {/* Checkpoints Interactive Panel */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare size={16} className="text-emerald-400" />
                Required Checkpoints ({currentStep.checkpoints?.length || 0})
              </h3>

              <div className="space-y-3">
                {currentStep.checkpoints?.map((cp) => {
                  const currentRecorded = currentStepRecorded[cp.id] || {};

                  return (
                    <div 
                      key={cp.id}
                      className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          {cp.label}
                        </span>
                        {cp.required && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                            MANDATORY
                          </span>
                        )}
                      </div>

                      {/* Type 1: Checklist */}
                      {cp.type === 'checklist' && (
                        <button
                          onClick={() => setStepCheckpointValue(cp.id, !currentRecorded.value, !currentRecorded.value ? 'PASS' : 'PENDING')}
                          className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm ${
                            currentRecorded.value === true
                              ? 'bg-emerald-600 text-white border border-emerald-400'
                              : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-850'
                          }`}
                        >
                          <CheckCircle2 size={18} className={currentRecorded.value === true ? 'text-white' : 'text-slate-500'} />
                          {currentRecorded.value === true ? 'Verified & Completed' : 'Click / Tap to Confirm Check'}
                        </button>
                      )}

                      {/* Type 2: Numeric Measurement */}
                      {cp.type === 'numeric' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                            <span>Target Spec: <span className="text-slate-200 font-bold">{cp.nominal} {cp.unit}</span></span>
                            <span>Allowed: [{cp.min} — {cp.max} {cp.unit}]</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              step="any"
                              value={currentRecorded.value !== undefined ? currentRecorded.value : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const num = parseFloat(val);
                                const isPass = !isNaN(num) && (cp.min === undefined || num >= cp.min) && (cp.max === undefined || num <= cp.max);
                                setStepCheckpointValue(cp.id, val, isPass ? 'PASS' : 'FAIL');
                              }}
                              placeholder={`Enter measurement (${cp.unit})`}
                              className={`flex-1 px-4 py-2.5 text-base font-mono font-bold rounded-xl border bg-slate-950 focus:outline-none ${
                                currentRecorded.value !== undefined && currentRecorded.value !== ''
                                  ? currentRecorded.status === 'PASS'
                                    ? 'border-emerald-500 text-emerald-300'
                                    : 'border-rose-500 text-rose-300 bg-rose-950/20'
                                  : 'border-slate-700 text-white'
                              }`}
                            />
                            <span className="font-mono text-sm text-slate-400 font-bold w-12">{cp.unit}</span>

                            {currentRecorded.value !== undefined && currentRecorded.value !== '' && (
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${
                                currentRecorded.status === 'PASS' 
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}>
                                {currentRecorded.status === 'PASS' ? 'IN-SPEC' : 'OUT-OF-SPEC'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Type 3: OK / NG Visual Inspection */}
                      {cp.type === 'ok_ng' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setStepCheckpointValue(cp.id, 'OK', 'PASS', '')}
                              className={`py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                                currentRecorded.value === 'OK'
                                  ? 'bg-emerald-600 text-white shadow-lg'
                                  : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-850'
                              }`}
                            >
                              <Check size={18} /> OK (PASS)
                            </button>

                            <button
                              onClick={() => setStepCheckpointValue(cp.id, 'NG', 'FAIL', currentRecorded.notes || 'Defect observed')}
                              className={`py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                                currentRecorded.value === 'NG'
                                  ? 'bg-rose-600 text-white shadow-lg'
                                  : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-850'
                              }`}
                            >
                              <X size={18} /> NG (DEFECT)
                            </button>
                          </div>

                          {currentRecorded.value === 'NG' && (
                            <div className="mt-2 bg-rose-950/40 border border-rose-800 rounded-lg p-2.5 space-y-1">
                              <label className="block text-[11px] font-bold text-rose-400 uppercase">
                                Defect Description / Reason (Mandatory):
                              </label>
                              <input
                                type="text"
                                value={currentRecorded.notes || ''}
                                onChange={(e) => setStepCheckpointValue(cp.id, 'NG', 'FAIL', e.target.value)}
                                placeholder="Explain defect: scratch, dent, loose fit, etc."
                                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-rose-700 rounded text-rose-200"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Type 4: Barcode / QR Scanner */}
                      {cp.type === 'scan_code' && (
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={currentRecorded.value || ''}
                            onChange={(e) => setStepCheckpointValue(cp.id, e.target.value, 'PASS')}
                            placeholder="Scan or enter barcode / serial..."
                            className="flex-1 px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                          />
                          <button
                            onClick={() => {
                              const autoVal = `${cp.expected_prefix || 'SN-'}${Math.floor(100000 + Math.random() * 900000)}`;
                              setStepCheckpointValue(cp.id, autoVal, 'PASS');
                              toast.success(`Barcode scanned: ${autoVal}`);
                            }}
                            className="px-3.5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Scan size={15} /> Simulate Scan
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Touch Bottom Controls: Prev & Next Navigation */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={18} />
              Previous Step
            </button>

            <button
              onClick={handleNextStep}
              className={`px-8 py-3.5 rounded-xl font-extrabold text-base text-white shadow-xl flex items-center gap-2 transition-all ${
                currentStepIndex === totalSteps - 1
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {currentStepIndex === totalSteps - 1 ? (
                <>
                  <CheckCircle2 size={20} />
                  Complete Execution
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Execution Completed Modal */}
      {isCompletedModalOpen && savedExecutionResult && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-center space-y-4 shadow-2xl">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              savedExecutionResult.overall_quality === 'PASS' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {savedExecutionResult.overall_quality === 'PASS' ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white">
                {savedExecutionResult.overall_quality === 'PASS' ? 'Work Instruction Successfully Executed!' : 'Execution Completed with Defect Recorded'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Shop-floor production record has been committed to the traceability database.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Document Number:</span>
                <span className="text-slate-200 font-bold">{savedExecutionResult.doc_number} ({savedExecutionResult.revision})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Station ID:</span>
                <span className="text-slate-200">{savedExecutionResult.station_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Serial Number:</span>
                <span className="text-emerald-400 font-bold">{savedExecutionResult.serial_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cycle Duration:</span>
                <span className="text-teal-400 font-bold">{formatTimer(savedExecutionResult.duration_seconds)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-500">Overall Quality Result:</span>
                <span className={`font-bold ${savedExecutionResult.overall_quality === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {savedExecutionResult.overall_quality}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsCompletedModalOpen(false);
                  setCurrentStepIndex(0);
                  setCheckpointValues({});
                  setElapsedSeconds(0);
                  setIsTimerRunning(true);
                  // Generate new serial for next unit
                  setSerialNumber(`HC-SN-${Math.floor(10000 + Math.random() * 90000)}`);
                }}
                className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-colors"
              >
                Start Next Unit
              </button>
              <button
                onClick={() => navigate('/digital-wi/executions')}
                className="px-5 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              >
                View History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
