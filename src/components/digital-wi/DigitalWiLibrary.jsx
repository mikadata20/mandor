import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Upload, CheckCircle2, Clock, AlertTriangle, 
  Archive, ShieldCheck, QrCode, PlayCircle, Search, Filter, 
  ExternalLink, ArrowUpRight, Copy, Trash2, Edit3, History,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { digitalWiDB } from '../../utils/digitalWiDB';
import toast from 'react-hot-toast';

export default function DigitalWiLibrary() {
  const navigate = useNavigate();
  const [wis, setWis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [selectedWiForHistory, setSelectedWiForHistory] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await digitalWiDB.getWorkInstructions({ search, status: statusFilter });
      setWis(data);
    } catch (e) {
      console.error('Failed to load WI Library:', e);
      toast.error('Gagal memuat dokumen WI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Hapus instruksi kerja "${title}"?`)) return;
    try {
      await digitalWiDB.deleteWorkInstruction(id);
      toast.success('Dokumen WI berhasil dihapus');
      loadData();
    } catch (e) {
      toast.error('Gagal menghapus WI');
    }
  };

  const handleCreateNewRevision = async (id) => {
    try {
      const updated = await digitalWiDB.createNewRevision(id, 'Manufacturing Engineer');
      toast.success(`Revisi baru dibuat (${updated.current_revision})`);
      navigate(`/digital-wi/editor/${updated.id}`);
    } catch (e) {
      toast.error('Gagal membuat revisi baru: ' + e.message);
    }
  };

  const departments = Array.from(new Set(wis.map(w => w.department).filter(Boolean)));

  const filteredWis = departmentFilter === 'ALL' 
    ? wis 
    : wis.filter(w => w.department === departmentFilter);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/digital-wi" className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1">
              <ArrowLeft size={14} /> Back to WI Dashboard
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FileText className="text-blue-500" size={28} />
            Work Instruction Library
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Master repository of controlled manufacturing procedures, revisions, and engineering specifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/digital-wi/import"
            className="px-4 py-2 text-xs md:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg shadow-md flex items-center gap-2 transition-all"
          >
            <Upload size={16} />
            Import PDF
          </Link>
          <Link
            to="/digital-wi/editor"
            className="px-4 py-2 text-xs md:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Create Blank WI
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Title, Doc #, Part..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs md:text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs md:text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Status</option>
              <option value="Published">Published</option>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Draft">Draft</option>
              <option value="Superseded">Superseded / Obsolete</option>
            </select>
          </div>

          {departments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 text-xs md:text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredWis.length}</span> instructions
        </div>
      </div>

      {/* Grid of WI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading Work Instructions...</div>
        ) : filteredWis.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700/60 p-8 space-y-3">
            <FileText size={36} className="mx-auto text-slate-500" />
            <p className="text-slate-300 font-semibold">No work instructions found.</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or import a new PDF document.</p>
            <Link
              to="/digital-wi/import"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              <Upload size={14} /> Import Work Instruction PDF
            </Link>
          </div>
        ) : (
          filteredWis.map((wi) => (
            <div
              key={wi.id}
              className="bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-lg space-y-4"
            >
              <div>
                {/* Header: Doc Number & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                      {wi.doc_number}
                    </span>
                    <span className="ml-2 font-mono text-xs text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                      {wi.current_revision}
                    </span>
                  </div>
                  {getStatusBadge(wi.status)}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mt-3 line-clamp-2">
                  {wi.title}
                </h3>

                {/* Part & Process info */}
                <div className="mt-2 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Part Number:</span>
                    <span className="font-mono text-slate-200">{wi.part_number || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Process:</span>
                    <span className="text-slate-200">{wi.process_name || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Department:</span>
                    <span className="text-slate-300">{wi.department || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Steps Count:</span>
                    <span className="text-emerald-400 font-semibold">{wi.steps?.length || 0} Steps</span>
                  </div>
                </div>

                {/* Description snippet */}
                {wi.description && (
                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 italic bg-slate-900/50 p-2 rounded border border-slate-800">
                    "{wi.description}"
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedWiForHistory(wi)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                    title="View Revision History"
                  >
                    <History size={14} />
                  </button>
                  {wi.status === 'Published' && (
                    <button
                      onClick={() => handleCreateNewRevision(wi.id)}
                      className="p-1.5 text-blue-400 hover:text-blue-300 bg-slate-900 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                      title="Create New Revision (ECO)"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(wi.id, wi.title)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-900 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                    title="Delete Work Instruction"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/digital-wi/editor/${wi.id}`)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>

                  {wi.status === 'Published' ? (
                    <button
                      onClick={() => navigate(`/digital-wi/operator/${wi.id}`)}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <PlayCircle size={13} />
                      Operator
                    </button>
                  ) : wi.status === 'Approved' ? (
                    <button
                      onClick={() => navigate('/digital-wi/deployments')}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <QrCode size={13} />
                      Deploy
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Revision History Modal */}
      {selectedWiForHistory && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="text-blue-400" size={20} />
                  Revision History & Audit
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedWiForHistory.doc_number} — {selectedWiForHistory.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedWiForHistory(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedWiForHistory.revisions && selectedWiForHistory.revisions.length > 0 ? (
                selectedWiForHistory.revisions.map((rev, index) => (
                  <div key={index} className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {rev.revision}
                      </span>
                      {getStatusBadge(rev.status)}
                    </div>
                    <p className="text-slate-300">{rev.change_summary || 'No change description recorded.'}</p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                      <span>Author: {rev.author || 'Engineer'}</span>
                      <span>Approver: {rev.approver || '-'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-4 text-center">
                  Only initial baseline revision recorded.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedWiForHistory(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg"
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
