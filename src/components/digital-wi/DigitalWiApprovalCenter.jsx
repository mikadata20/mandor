import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle, 
  ArrowLeft, FileText, UserCheck, MessageSquare, ExternalLink,
  ChevronRight, RefreshCw, Send, Check, X
} from 'lucide-react';
import { digitalWiDB } from '../../utils/digitalWiDB';
import toast from 'react-hot-toast';

export default function DigitalWiApprovalCenter() {
  const navigate = useNavigate();
  const [wis, setWis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, APPROVED, AUDIT_LOGS
  const [auditLogs, setAuditLogs] = useState([]);

  // Modal Sign-off State
  const [selectedWi, setSelectedWi] = useState(null);
  const [approvalModalType, setApprovalModalType] = useState(null); // 'APPROVE' | 'REJECT' | 'PUBLISH'
  const [approverName, setApproverName] = useState('Quality Manager (Dedi R.)');
  const [comments, setComments] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allWis, logs] = await Promise.all([
        digitalWiDB.getWorkInstructions(),
        digitalWiDB.getAuditLogs()
      ]);
      setWis(allWis);
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat Approval Center');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingWis = wis.filter(w => w.status === 'Pending Approval');
  const approvedWis = wis.filter(w => w.status === 'Approved');

  const handleConfirmAction = async () => {
    if (!selectedWi) return;
    try {
      if (approvalModalType === 'APPROVE') {
        await digitalWiDB.approveWorkInstruction(
          selectedWi.id, 
          approverName, 
          comments || 'Approved per ISO 9001 and Engineering specifications.'
        );
        toast.success(`Dokumen ${selectedWi.doc_number} berhasil disetujui (Approved)!`);
      } else if (approvalModalType === 'REJECT') {
        await digitalWiDB.rejectWorkInstruction(
          selectedWi.id, 
          approverName, 
          comments || 'Revisi ditolak, mohon periksa kembali spesifikasi.'
        );
        toast.success(`Dokumen ${selectedWi.doc_number} dikembalikan ke Draft.`);
      } else if (approvalModalType === 'PUBLISH') {
        await digitalWiDB.publishWorkInstruction(
          selectedWi.id, 
          approverName
        );
        toast.success(`Dokumen ${selectedWi.doc_number} berhasil dipublikasikan ke Shop Floor!`);
      }

      setSelectedWi(null);
      setApprovalModalType(null);
      setComments('');
      loadData();
    } catch (e) {
      toast.error('Aksi gagal: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/digital-wi" className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1">
              <ArrowLeft size={14} /> Back to WI Dashboard
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="text-amber-400" size={28} />
            Work Instruction Approval Center
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Formal review and release governance for controlled manufacturing instructions before station deployment.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white bg-slate-800/40'
          }`}
        >
          <Clock size={15} />
          Pending Approval ({pendingWis.length})
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'APPROVED'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-white bg-slate-800/40'
          }`}
        >
          <CheckCircle2 size={15} />
          Approved & Ready to Publish ({approvedWis.length})
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white bg-slate-800/40'
          }`}
        >
          <UserCheck size={15} />
          Audit Trail Sign-offs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Pending Approval Queue */}
      {activeTab === 'PENDING' && (
        <div className="space-y-4">
          {pendingWis.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-700/60 p-8 space-y-3">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
              <h3 className="text-base font-bold text-white">All Clear! No Pending Approvals</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No work instructions are currently queued for managerial sign-off.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingWis.map((wi) => (
                <div key={wi.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                          {wi.doc_number}
                        </span>
                        <span className="font-mono text-xs text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                          {wi.current_revision}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-2">{wi.title}</h3>
                      <div className="text-xs text-slate-400 mt-1">
                        Part: <span className="font-mono text-slate-300">{wi.part_number || '-'}</span> • {wi.process_name}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-950 text-amber-400 border border-amber-800">
                      Pending Sign-off
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                    <div className="text-slate-400">Total Steps: <span className="text-white font-semibold">{wi.steps?.length || 0}</span></div>
                    <div className="text-slate-400">Department: <span className="text-slate-200">{wi.department}</span></div>
                    <div className="text-slate-400">Submitted by: <span className="text-slate-200">{wi.created_by || 'Manufacturing Engineer'}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                    <button
                      onClick={() => navigate(`/digital-wi/editor/${wi.id}`)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      Inspect in Editor <ChevronRight size={13} />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedWi(wi);
                          setApprovalModalType('REJECT');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded border border-rose-800/80 flex items-center gap-1 transition-colors"
                      >
                        <X size={14} /> Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWi(wi);
                          setApprovalModalType('APPROVE');
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Check size={14} /> Sign & Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Approved & Ready to Publish */}
      {activeTab === 'APPROVED' && (
        <div className="space-y-4">
          {approvedWis.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-700/60 p-8 space-y-3">
              <ShieldCheck size={36} className="mx-auto text-blue-500" />
              <h3 className="text-base font-bold text-white">No Approved Unreleased Documents</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All approved work instructions are already published or in deployment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedWis.map((wi) => (
                <div key={wi.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                          {wi.doc_number}
                        </span>
                        <span className="font-mono text-xs text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                          {wi.current_revision}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-2">{wi.title}</h3>
                      <div className="text-xs text-slate-400 mt-1">
                        Part: <span className="font-mono text-slate-300">{wi.part_number || '-'}</span> • {wi.process_name}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-950 text-blue-400 border border-blue-800">
                      Approved
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400">Document is verified and signed off. Ready to release to shop-floor operator terminals.</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                    <Link
                      to="/digital-wi/deployments"
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                    >
                      Assign Station Mapping <ChevronRight size={13} />
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedWi(wi);
                        setApprovalModalType('PUBLISH');
                      }}
                      className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <CheckCircle2 size={14} /> Publish to Stations
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Full Audit Trail */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700 bg-slate-900/60 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              ISO 9001 Compliance Governance Logs
            </span>
            <span className="text-xs text-slate-400">Total {auditLogs.length} events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Signatory</th>
                  <th className="px-4 py-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-750/50">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-200">
                        {log.doc_number || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-medium">
                        {log.user_name}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {log.details ? JSON.stringify(log.details).substring(0, 80) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sign-off Modal */}
      {selectedWi && approvalModalType && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {approvalModalType === 'APPROVE' && <CheckCircle2 className="text-emerald-400" size={20} />}
                {approvalModalType === 'REJECT' && <XCircle className="text-rose-400" size={20} />}
                {approvalModalType === 'PUBLISH' && <ShieldCheck className="text-blue-400" size={20} />}
                {approvalModalType === 'APPROVE' ? 'Managerial Sign-off & Approval' :
                 approvalModalType === 'REJECT' ? 'Request Revision & Reject' : 'Publish Controlled WI'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {selectedWi.doc_number} ({selectedWi.current_revision}) — {selectedWi.title}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Signatory / Approver Name *</label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  {approvalModalType === 'REJECT' ? 'Rejection Reason / Required Changes *' : 'Approval Comments / Quality Notes'}
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={approvalModalType === 'REJECT' ? 'Explain what changes are needed before approval...' : 'Verification comments (optional)...'}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 leading-relaxed"
                />
              </div>

              {approvalModalType === 'PUBLISH' && (
                <div className="bg-amber-950/30 border border-amber-800/40 p-3 rounded text-amber-200/90 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle size={14} /> Immutability Warning
                  </p>
                  <p className="text-[11px]">
                    Once published, this revision will be locked and deployed to stations. Further edits will require creating a new revision (ECO).
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-700 flex items-center justify-end gap-2.5">
              <button
                onClick={() => { setSelectedWi(null); setApprovalModalType(null); }}
                className="px-4 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-5 py-2 text-xs font-bold rounded text-white shadow-md ${
                  approvalModalType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' :
                  approvalModalType === 'REJECT' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                Confirm {approvalModalType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
