import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, Search, Filter, ArrowLeft, RefreshCw, CheckCircle2, 
  XCircle, Clock, Calendar, User, MapPin, Eye, FileSpreadsheet,
  AlertTriangle, Layers
} from 'lucide-react';
import { digitalWiDB } from '../../utils/digitalWiDB';
import toast from 'react-hot-toast';

export default function DigitalWiExecutionHistory() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [qualityFilter, setQualityFilter] = useState('ALL');
  const [selectedExec, setSelectedExec] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await digitalWiDB.getExecutions({
        station_id: stationFilter === 'ALL' ? undefined : stationFilter,
        quality: qualityFilter === 'ALL' ? undefined : qualityFilter
      });
      setExecutions(data);
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat histori eksekusi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [stationFilter, qualityFilter]);

  const stations = Array.from(new Set(executions.map(e => e.station_id).filter(Boolean)));

  const filtered = executions.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.doc_number?.toLowerCase().includes(q) ||
      e.title?.toLowerCase().includes(q) ||
      e.serial_number?.toLowerCase().includes(q) ||
      e.operator_name?.toLowerCase().includes(q) ||
      e.work_order_id?.toLowerCase().includes(q)
    );
  });

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
            <Activity className="text-teal-400" size={28} />
            Operator Execution Records & Traceability
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Immutable production records, operator inputs, torque measurements, and checkpoint inspection logs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Records
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Serial, WO, Operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-60"
            />
          </div>

          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Stations</option>
            {stations.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Quality</option>
            <option value="PASS">PASS Only</option>
            <option value="FAIL">FAIL / Defect Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filtered.length}</span> recorded executions
        </div>
      </div>

      {/* Executions Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Serial & WO</th>
                <th className="px-4 py-3">Instruction & Rev</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                    No operator execution records found.
                  </td>
                </tr>
              ) : (
                filtered.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {new Date(exec.start_time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-100">{exec.serial_number || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{exec.work_order_id || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{exec.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {exec.doc_number} • {exec.revision}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {exec.station_id || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {exec.operator_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                        exec.overall_quality === 'PASS'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {exec.overall_quality === 'PASS' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {exec.overall_quality}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedExec(exec)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded border border-slate-600 transition-colors"
                      >
                        Inspect Log
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Inspection Modal */}
      {selectedExec && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-700 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    selectedExec.overall_quality === 'PASS' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {selectedExec.overall_quality}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{selectedExec.serial_number}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedExec.title}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedExec.doc_number} ({selectedExec.revision})</p>
              </div>
              <button
                onClick={() => setSelectedExec(null)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono">
              <div>Operator: <span className="text-slate-200 font-sans">{selectedExec.operator_name}</span></div>
              <div>Station: <span className="text-slate-200">{selectedExec.station_id}</span></div>
              <div>Started: <span className="text-slate-200">{new Date(selectedExec.start_time).toLocaleTimeString()}</span></div>
              <div>Completed: <span className="text-slate-200">{selectedExec.completion_time ? new Date(selectedExec.completion_time).toLocaleTimeString() : '-'}</span></div>
            </div>

            {selectedExec.defect_notes && (
              <div className="bg-rose-950/40 border border-rose-800/80 p-3 rounded-lg text-xs text-rose-300 space-y-1">
                <span className="font-bold flex items-center gap-1"><AlertTriangle size={13} /> Recorded Defect Note:</span>
                <p>{selectedExec.defect_notes}</p>
              </div>
            )}

            {/* Checkpoint Breakdown */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Step-Level Recorded Results
              </span>
              {selectedExec.step_results?.map((res, i) => (
                <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
                  <span className="font-bold text-emerald-400 font-mono">Step {res.step_number}</span>
                  <div className="space-y-1">
                    {res.checkpoints?.map((cp, j) => (
                      <div key={j} className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>Check #{j + 1}: <span className="font-mono text-slate-400">{cp.id}</span></span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-100 font-semibold">{String(cp.value)}</span>
                          <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${cp.status === 'PASS' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                            {cp.status || 'OK'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedExec(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
