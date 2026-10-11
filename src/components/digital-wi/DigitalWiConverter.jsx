import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, FileText, Sparkles, CheckCircle2, AlertCircle, ArrowLeft, 
  ArrowRight, Eye, RefreshCw, Layers, CheckSquare, Wrench, ShieldAlert,
  Sliders, FileUp, Cpu
} from 'lucide-react';
import { DigitalWiAiParser } from '../../services/ai/DigitalWiAiParser';
import { digitalWiDB } from '../../utils/digitalWiDB';
import toast from 'react-hot-toast';

export default function DigitalWiConverter() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [metadata, setMetadata] = useState({
    docNumber: 'WI-HYD-002',
    title: 'High-Pressure Hydraulic Actuator Valve Assembly',
    partNumber: 'ACT-VLV-500',
    partName: 'Directional Control Valve Block',
    processName: 'Spool Insertion & Seal Torquing',
    department: 'Hydraulics Line A',
    station: 'Station-ACT-01',
    revision: 'Rev A',
    language: 'en'
  });

  // Extraction State
  const [extractedPdfData, setExtractedPdfData] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ stage: 'IDLE', percent: 0, message: '' });
  const [extractedResult, setExtractedResult] = useState(null);
  const [activePreviewStep, setActivePreviewStep] = useState(0);

  // Handle Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (selectedFile) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Mohon unggah file format PDF (.pdf)');
      return;
    }
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setExtractedResult(null);

    // Initial read to get pages
    try {
      setIsProcessing(true);
      const pdfData = await DigitalWiAiParser.extractPdfContent(
        selectedFile, 
        {}, 
        (p) => setProgress(p)
      );
      setExtractedPdfData(pdfData);
      setSelectedPages(pdfData.pages.map(p => p.pageNumber));
      toast.success(`PDF berhasil dibaca (${pdfData.totalPages} halaman)`);
    } catch (e) {
      console.error('Error parsing PDF:', e);
      toast.error('Gagal membaca PDF: ' + e.message);
    } finally {
      setIsProcessing(false);
      setProgress({ stage: 'IDLE', percent: 0, message: '' });
    }
  };

  // Load Demo Manufacturing PDF
  const loadDemoPdf = async () => {
    // Generate synthetic dummy PDF bytes or mock PDF data
    setIsProcessing(true);
    setProgress({ stage: 'LOADING_PDF', percent: 25, message: 'Loading Industrial Sample SOP PDF...' });

    setTimeout(() => {
      const mockPages = [
        {
          pageNumber: 1,
          text: `WORK INSTRUCTION: WI-HYD-002
PART NUMBER: ACT-VLV-500
PROCESS: Spool Insertion & Seal Torquing
REVISION: Rev A
PAGE 1 OF 3

STEP 1: Incoming Inspection & Cleaning
1. Clean valve block cavity with lint-free cloth and isopropyl alcohol.
2. Inspect internal bore for burrs, metal chips, or surface corrosion.
Safety: Wear chemical resistant gloves and safety goggles.
Tools: Inspection Mirror, LED Lamp, Isopropyl alcohol.
Checkpoint: Scan valve body serial barcode.
Checkpoint: Cleanliness verification PASS/FAIL.`,
          thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          wasOcrUsed: false
        },
        {
          pageNumber: 2,
          text: `PAGE 2 OF 3
STEP 2: Spool Installation & Fluorocarbon Seal Fitting
1. Lubricate spool shaft with hydraulic fluid ISO VG 46.
2. Carefully guide spool into bore without forcing.
3. Seat primary FKM Viton seals into gland groove.
Warning: Do not scratch precision ground surface.
Tools: Guide sleeve tool #3, non-marring plastic pick.
Materials: Viton O-ring Ø24mm, Backup ring PTFE.
Checkpoint: Visual check - Seal seated without twist.
Checkpoint: Measure axial sliding force (nominal 15 N, min 10 N, max 20 N).`,
          thumbnail: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
          wasOcrUsed: false
        },
        {
          pageNumber: 3,
          text: `PAGE 3 OF 3
STEP 3: End Cover Fastening & Proof Pressure Test
1. Position end-cover gasket and start 4x M8 socket head cap screws.
2. Torque screws in diagonal star sequence to 28.0 Nm using digital torque wrench.
3. Connect pressure test hose and pressurize to 250 bar for 15 seconds.
Safety: Keep protective safety door closed during high pressure proof test!
Tools: Digital torque wrench (10-50 Nm), Hydraulic test rig.
Checkpoint: Measured Torque on Cap Screws (28.0 +/- 1.5 Nm).
Checkpoint: Hydrostatic test pressure hold (min 245 bar, max 260 bar).
Checkpoint: Zero fluid leakage PASS/FAIL.`,
          thumbnail: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
          wasOcrUsed: false
        }
      ];

      const mockPdfData = {
        totalPages: 3,
        pages: mockPages,
        combinedText: mockPages.map(p => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n')
      };

      setFileName('Demo_Valve_Assembly_SOP.pdf');
      setExtractedPdfData(mockPdfData);
      setSelectedPages([1, 2, 3]);
      setIsProcessing(false);
      setProgress({ stage: 'IDLE', percent: 0, message: '' });
      toast.success('Sample Industrial PDF berhasil dimuat!');
    }, 600);
  };

  // Start AI Extraction & Structure Recognition
  const handleStartAiExtraction = async () => {
    if (!extractedPdfData) {
      toast.error('Pilih atau unggah file PDF terlebih dahulu');
      return;
    }

    try {
      setIsProcessing(true);
      const filteredPdf = {
        ...extractedPdfData,
        pages: extractedPdfData.pages.filter(p => selectedPages.includes(p.pageNumber))
      };

      const result = await DigitalWiAiParser.structureWithAI(
        filteredPdf, 
        metadata, 
        (p) => setProgress(p)
      );

      setExtractedResult(result);
      setActivePreviewStep(0);
      toast.success(`Berhasil mengekstraksi ${result.steps.length} langkah instruksi kerja!`);
    } catch (e) {
      console.error('AI Extraction Error:', e);
      toast.error('Gagal memproses dokumen dengan AI: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save as Draft and Open Editor
  const handleSaveAndOpenEditor = async () => {
    if (!extractedResult) return;

    try {
      const newWi = {
        id: `wi-${Date.now()}`,
        doc_number: metadata.docNumber || extractedResult.document.document_number,
        title: metadata.title || extractedResult.document.title,
        part_number: metadata.partNumber || extractedResult.document.part_number,
        part_name: metadata.partName || extractedResult.document.part_name,
        process_name: metadata.processName || extractedResult.document.process_name,
        department: metadata.department || extractedResult.document.department || 'Production Assembly',
        current_revision: metadata.revision || 'Rev A',
        status: 'Draft',
        description: extractedResult.document.description,
        source_pdf_name: fileName,
        created_by: 'Manufacturing Engineer',
        revisions: [
          {
            revision: metadata.revision || 'Rev A',
            status: 'Draft',
            author: 'Manufacturing Engineer',
            created_at: new Date().toISOString(),
            change_summary: `Initial AI conversion from ${fileName}`
          }
        ],
        steps: extractedResult.steps
      };

      await digitalWiDB.saveWorkInstruction(newWi);
      toast.success('Instruksi kerja berhasil disimpan sebagai Draft!');
      navigate(`/digital-wi/editor/${newWi.id}`);
    } catch (e) {
      console.error('Error saving WI:', e);
      toast.error('Gagal menyimpan WI: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/digital-wi" className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1">
              <ArrowLeft size={14} /> Back to WI Dashboard
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="text-emerald-400" size={28} />
            AI Work Instruction Converter
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Ingest engineering SOPs and CAD instruction PDFs, auto-detect sequential steps, tools, safety warnings, and inspection checkpoints.
          </p>
        </div>

        <button
          onClick={loadDemoPdf}
          disabled={isProcessing}
          className="px-4 py-2 text-xs md:text-sm font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg border border-indigo-500/40 flex items-center gap-2 transition-colors"
        >
          <Cpu size={16} />
          Load Demo Industrial PDF
        </button>
      </div>

      {/* Main Upload & Form Section */}
      {!extractedResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload Area (1 col) */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileUp size={16} className="text-emerald-400" />
              1. Upload Work Instruction PDF
            </h2>

            {/* Drag & drop box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-all space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {fileName ? fileName : 'Drag & Drop PDF or Click to Browse'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Supports vector PDFs and scanned documents via OCR</p>
              </div>
              {fileName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-800/80 rounded-full text-xs text-emerald-400">
                  <CheckCircle2 size={13} /> {fileName}
                </div>
              )}
            </div>

            {/* Page selection pills if PDF loaded */}
            {extractedPdfData && (
              <div className="space-y-2 pt-2 border-t border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Select Pages to Ingest:</span>
                  <button
                    onClick={() => {
                      if (selectedPages.length === extractedPdfData.totalPages) {
                        setSelectedPages([1]);
                      } else {
                        setSelectedPages(extractedPdfData.pages.map(p => p.pageNumber));
                      }
                    }}
                    className="text-emerald-400 hover:underline text-[11px]"
                  >
                    {selectedPages.length === extractedPdfData.totalPages ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extractedPdfData.pages.map((p) => {
                    const isSelected = selectedPages.includes(p.pageNumber);
                    return (
                      <button
                        key={p.pageNumber}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedPages(selectedPages.filter(num => num !== p.pageNumber));
                          } else {
                            setSelectedPages([...selectedPages, p.pageNumber]);
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                      >
                        Page {p.pageNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Metadata Form & Settings (2 cols) */}
          <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} className="text-blue-400" />
              2. Document Metadata & Engineering Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Document Number *</label>
                <input
                  type="text"
                  value={metadata.docNumber}
                  onChange={(e) => setMetadata({ ...metadata, docNumber: e.target.value })}
                  placeholder="e.g. WI-ASSY-001"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">WI Title *</label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  placeholder="e.g. Main Piston & Seal Assembly"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Part Number</label>
                <input
                  type="text"
                  value={metadata.partNumber}
                  onChange={(e) => setMetadata({ ...metadata, partNumber: e.target.value })}
                  placeholder="e.g. HC-100-PRO"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Part Name</label>
                <input
                  type="text"
                  value={metadata.partName}
                  onChange={(e) => setMetadata({ ...metadata, partName: e.target.value })}
                  placeholder="e.g. Directional Control Valve Block"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Process Name</label>
                <input
                  type="text"
                  value={metadata.processName}
                  onChange={(e) => setMetadata({ ...metadata, processName: e.target.value })}
                  placeholder="e.g. Spool Insertion & Seal Torquing"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Department / Line</label>
                <input
                  type="text"
                  value={metadata.department}
                  onChange={(e) => setMetadata({ ...metadata, department: e.target.value })}
                  placeholder="e.g. Hydraulics Line A"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Initial Revision</label>
                <input
                  type="text"
                  value={metadata.revision}
                  onChange={(e) => setMetadata({ ...metadata, revision: e.target.value })}
                  placeholder="Rev A"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Document Language</label>
                <select
                  value={metadata.language}
                  onChange={(e) => setMetadata({ ...metadata, language: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="en">English (US/UK)</option>
                  <option value="id">Bahasa Indonesia</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="ja">Japanese (日本語)</option>
                </select>
              </div>
            </div>

            {/* Progress Bar (if processing) */}
            {isProcessing && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin" />
                    {progress.message || 'Processing PDF document...'}
                  </span>
                  <span className="font-mono text-slate-400">{progress.percent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-end">
              <button
                onClick={handleStartAiExtraction}
                disabled={isProcessing || !extractedPdfData || selectedPages.length === 0}
                className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
              >
                <Sparkles size={18} />
                Start AI Extraction ({selectedPages.length} Pages)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Extracted Result Review Mode */
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-emerald-500/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  AI EXTRACTION SUCCESSFUL
                </span>
                <span className="text-xs text-slate-300 font-mono">{metadata.docNumber} • {metadata.revision}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {extractedResult.document.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Identified {extractedResult.steps.length} sequential steps with tools, materials, safety warnings, and inspection checkpoints.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setExtractedResult(null)}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
              >
                Back / Re-scan
              </button>
              <button
                onClick={handleSaveAndOpenEditor}
                className="px-5 py-2 text-xs md:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md flex items-center gap-2 transition-colors"
              >
                Open in Visual Step Editor <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Side by side: Step List & Detail Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Steps Navigation list (1 col) */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Generated Steps ({extractedResult.steps.length})
              </h3>
              <div className="space-y-2">
                {extractedResult.steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePreviewStep(idx)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                      activePreviewStep === idx
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold font-mono">Step {step.step_number}</span>
                      <span className="text-[10px] text-slate-400">{step.checkpoints?.length || 0} checks</span>
                    </div>
                    <div className="mt-1 line-clamp-1">{step.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Step Details & Original Source Image (2 cols) */}
            {extractedResult.steps[activePreviewStep] && (
              <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 space-y-5">
                <div className="border-b border-slate-700 pb-3 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider">
                      Step {extractedResult.steps[activePreviewStep].step_number} of {extractedResult.steps.length}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {extractedResult.steps[activePreviewStep].title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                    Source Page: {extractedResult.steps[activePreviewStep].source_pages?.join(', ') || 1}
                  </span>
                </div>

                {/* Instruction Text */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Instruction Description:
                  </h4>
                  <p className="text-sm text-slate-200 bg-slate-900/80 p-3.5 rounded-lg border border-slate-700 leading-relaxed">
                    {extractedResult.steps[activePreviewStep].instruction}
                  </p>
                </div>

                {/* Safety & Tools row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Safety */}
                  <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-3 text-xs space-y-1.5">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <ShieldAlert size={14} /> Safety Precautions:
                    </span>
                    {extractedResult.steps[activePreviewStep].safety_warnings?.length > 0 ? (
                      <ul className="list-disc list-inside text-amber-200/90 space-y-1">
                        {extractedResult.steps[activePreviewStep].safety_warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-500 italic">Standard PPE safety rules apply.</span>
                    )}
                  </div>

                  {/* Tools */}
                  <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-3 text-xs space-y-1.5">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Wrench size={14} /> Tools & Materials:
                    </span>
                    {extractedResult.steps[activePreviewStep].tools?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {extractedResult.steps[activePreviewStep].tools.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">No special tools detected.</span>
                    )}
                  </div>
                </div>

                {/* Checkpoints Preview */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CheckSquare size={15} className="text-emerald-400" />
                    Mandatory Operator Checkpoints:
                  </h4>
                  <div className="space-y-2">
                    {extractedResult.steps[activePreviewStep].checkpoints?.map((cp, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-200">{cp.label}</span>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Type: <span className="font-mono text-emerald-400 uppercase">{cp.type}</span>
                            {cp.type === 'numeric' && ` • Spec: ${cp.min} to ${cp.max} ${cp.unit}`}
                          </div>
                        </div>
                        {cp.required && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                            REQUIRED
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thumbnail Preview */}
                {extractedResult.steps[activePreviewStep].images?.[0] && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Eye size={14} /> Original Document Reference:
                    </h4>
                    <div className="h-44 rounded-lg overflow-hidden border border-slate-700 bg-black flex items-center justify-center">
                      <img 
                        src={extractedResult.steps[activePreviewStep].images[0]} 
                        alt="Step Diagram" 
                        className="h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
