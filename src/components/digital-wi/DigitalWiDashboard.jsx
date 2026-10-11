import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Upload, CheckCircle2, Clock, AlertTriangle, 
  Archive, ShieldCheck, QrCode, PlayCircle, Search, Filter, 
  ExternalLink, ArrowUpRight, BarChart3, CheckSquare, Layers, 
  Activity, RefreshCw, Eye
} from 'lucide-react';
import { digitalWiDB } from '../../utils/digitalWiDB';

export default function DigitalWiDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    published: 0,
    obsolete: 0,
    totalDeployments: 0,
    recentExecutionsCount: 0,
    firstPassYield: 100
  });

  const [recentWis, setRecentWis] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, wis, execs] = await Promise.all([
        digitalWiDB.getDashboardMetrics(),
        digitalWiDB.getWorkInstructions({ search, status: statusFilter }),
        digitalWiDB.getExecutions()
      ]);
      setMetrics(m);
      setRecentWis(wis);
      setRecentExecutions(execs.slice(0, 5));
    } catch (e) {
      console.error('Error loading Digital WI dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Published':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 size={12} /> Published</span>;
      case 'Approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><ShieldCheck size={12} /> Approved</span>;
      case 'Pending Approval':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><Clock size={12} /> Pending Approval</span>;
      case 'Draft':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">Draft</span>;
      case 'Superseded':
      case 'Obsolete':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200"><Archive size={12} /> Superseded</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
              MAVI MANUFACTURING MODULE
            </span>
            <span className="text-xs text-slate-400">ISO 9001 & IATF 16949 COMPLIANT</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-3">
            <FileText className="text-emerald-500" size={28} />
            Digital Work Instruction (WI) Hub
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Convert standard PDF blueprints into interactive digital steps, maintain revision control, and deploy touch-ready operator runtimes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            to="/digital-wi/import"
            className="px-4 py-2 text-xs md:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg shadow-md flex items-center gap-2 transition-all hover:shadow-emerald-900/30"
          >
            <Upload size={16} />
            Import PDF / AI Converter
          </Link>
          <Link
            to="/digital-wi/editor"
            className="px-3.5 py-2 text-xs md:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Plus size={16} />
            Create Blank WI
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total WI</span>
            <FileText size={16} className="text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white">{metrics.total}</div>
            <div className="text-xs text-slate-400 mt-0.5">Controlled Documents</div>
          </div>
        </div>

        {/* Draft */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Draft</span>
            <Layers size={16} className="text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-200">{metrics.draft}</div>
            <div className="text-xs text-slate-400 mt-0.5">Work In Progress</div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending</span>
            <Clock size={16} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-300">{metrics.pending}</div>
            <Link to="/digital-wi/approvals" className="text-xs text-amber-400/90 hover:underline mt-0.5 flex items-center gap-1">
              Review Queue <ArrowUpRight size={10} />
            </Link>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Approved</span>
            <ShieldCheck size={16} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-300">{metrics.approved}</div>
            <div className="text-xs text-slate-400 mt-0.5">Ready for Release</div>
          </div>
        </div>

        {/* Published */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Published</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-400">{metrics.published}</div>
            <div className="text-xs text-emerald-400/80 mt-0.5">Active on Stations</div>
          </div>
        </div>

        {/* Superseded */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Superseded</span>
            <Archive size={16} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-300">{metrics.obsolete}</div>
            <div className="text-xs text-slate-400 mt-0.5">Historical Revisions</div>
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link 
          to="/digital-wi/library" 
          className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/50 rounded-xl p-4 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileText size={20} />
          </div>
          <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-sm">WI Document Library</h3>
          <p className="text-xs text-slate-400 mt-1">Browse and filter all engineering work instructions, CAD references, and revision histories.</p>
        </Link>

        <Link 
          to="/digital-wi/import" 
          className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-500/50 rounded-xl p-4 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Upload size={20} />
          </div>
          <h3 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors text-sm">AI WI Converter</h3>
          <p className="text-xs text-slate-400 mt-1">Drag-and-drop PDF instructions, auto-extract steps, tools, and quality checkpoints via AI.</p>
        </Link>

        <Link 
          to="/digital-wi/approvals" 
          className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-amber-500/50 rounded-xl p-4 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors text-sm">Approval Center</h3>
          <p className="text-xs text-slate-400 mt-1">Manage formal sign-offs, change reviews, and revision release governance before publishing.</p>
        </Link>

        <Link 
          to="/digital-wi/deployments" 
          className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-purple-500/50 rounded-xl p-4 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <QrCode size={20} />
          </div>
          <h3 className="font-bold text-slate-100 group-hover:text-purple-400 transition-colors text-sm">Station QR Deployments</h3>
          <p className="text-xs text-slate-400 mt-1">Bind approved WIs to production workstations and generate QR access placards for operator kiosks.</p>
        </Link>
      </div>

      {/* Main Content Split: Recent WIs & Shop Floor Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Work Instructions Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers size={18} className="text-emerald-400" />
                  Active Controlled Work Instructions
                </h2>
                <p className="text-xs text-slate-400">Search and filter by document code, part number, or status</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search WI or Part..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="Published">Published</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Approval">Pending</option>
                  <option value="Draft">Draft</option>
                  <option value="Superseded">Superseded</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-700/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700/70">
                  <tr>
                    <th className="px-3.5 py-2.5">Doc # & Rev</th>
                    <th className="px-3.5 py-2.5">Title & Process</th>
                    <th className="px-3.5 py-2.5">Part Number</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentWis.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                        {loading ? 'Loading work instructions...' : 'No work instructions match the filter criteria.'}
                      </td>
                    </tr>
                  ) : (
                    recentWis.map((wi) => (
                      <tr key={wi.id} className="hover:bg-slate-750/50 transition-colors">
                        <td className="px-3.5 py-3 font-mono font-medium text-slate-200">
                          <div>{wi.doc_number}</div>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            {wi.current_revision}
                          </span>
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="font-semibold text-white">{wi.title}</div>
                          <div className="text-[11px] text-slate-400">{wi.process_name} • {wi.department}</div>
                        </td>
                        <td className="px-3.5 py-3 font-mono text-slate-300">
                          {wi.part_number || '-'}
                        </td>
                        <td className="px-3.5 py-3">
                          {getStatusBadge(wi.status)}
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/digital-wi/editor/${wi.id}`)}
                              className="px-2.5 py-1 text-[11px] bg-slate-700 hover:bg-slate-600 text-slate-200 rounded border border-slate-600 transition-colors"
                              title="Edit WI in Visual Editor"
                            >
                              Edit
                            </button>
                            {wi.status === 'Published' && (
                              <button
                                onClick={() => navigate(`/digital-wi/operator/${wi.id}`)}
                                className="px-2 py-1 text-[11px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded border border-emerald-500/40 transition-colors flex items-center gap-1"
                                title="Run Operator Mode"
                              >
                                <PlayCircle size={12} />
                                Run
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {recentWis.length} instructions</span>
            <Link to="/digital-wi/library" className="text-emerald-400 hover:underline flex items-center gap-1 font-medium">
              Open Full WI Library <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Operator Executions & Quality Yield (1 col) */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-teal-400" />
                  Operator Executions
                </h2>
                <p className="text-xs text-slate-400">Live shop-floor completions</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                FPY {metrics.firstPassYield}%
              </span>
            </div>

            <div className="space-y-3">
              {recentExecutions.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No execution records logged yet.
                </div>
              ) : (
                recentExecutions.map((exec) => (
                  <div key={exec.id} className="bg-slate-900/70 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{exec.title}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${exec.overall_quality === 'PASS' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-rose-900/60 text-rose-300 border border-rose-700'}`}>
                        {exec.overall_quality}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>SN: <span className="font-mono text-slate-300">{exec.serial_number || 'N/A'}</span></span>
                      <span>{exec.station_id}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-800">
                      <span>Operator: {exec.operator_name}</span>
                      <span>{new Date(exec.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link to="/digital-wi/executions" className="text-xs text-teal-400 hover:underline flex items-center justify-between font-medium">
              <span>View Full Execution History & Traceability</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
