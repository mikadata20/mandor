import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  QrCode, Plus, MapPin, Printer, ExternalLink, PlayCircle, 
  Trash2, ArrowLeft, RefreshCw, Layers, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { digitalWiDB } from '../../utils/digitalWiDB';
import toast from 'react-hot-toast';

export default function DigitalWiDeployments() {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState([]);
  const [wis, setWis] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Deployment Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeploy, setNewDeploy] = useState({
    wi_id: '',
    station_id: 'Station-ASSY-01',
    station_name: 'Piston Sub-Assembly Cell #1',
    line_name: 'Hydraulics Assembly Line A',
    process_code: 'ASY-HYD-01'
  });

  // Print placard modal
  const [placardModal, setPlacardModal] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deps, allWis] = await Promise.all([
        digitalWiDB.getDeployments(),
        digitalWiDB.getWorkInstructions()
      ]);
      setDeployments(deps);
      // Only approved or published WIs can be deployed
      setWis(allWis.filter(w => w.status === 'Approved' || w.status === 'Published'));
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat station deployments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDeployment = async () => {
    const selectedWi = wis.find(w => w.id === newDeploy.wi_id);
    if (!selectedWi) {
      toast.error('Pilih Instruksi Kerja yang valid');
      return;
    }
    if (!newDeploy.station_id.trim()) {
      toast.error('Station ID wajib diisi');
      return;
    }

    try {
      await digitalWiDB.saveDeployment({
        ...newDeploy,
        doc_number: selectedWi.doc_number,
        title: selectedWi.title,
        active_revision: selectedWi.current_revision,
        deployed_by: 'Production Engineer'
      });
      toast.success(`Berhasil mendeploy ${selectedWi.doc_number} ke ${newDeploy.station_id}`);
      setShowAddModal(false);
      loadData();
    } catch (e) {
      toast.error('Gagal menyimpan deployment: ' + e.message);
    }
  };

  const handleDeleteDeployment = async (id) => {
    if (!window.confirm('Hapus pemetaan station deployment ini?')) return;
    try {
      await digitalWiDB.deleteDeployment(id);
      toast.success('Station assignment dihapus');
      loadData();
    } catch (e) {
      toast.error('Gagal menghapus');
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
            <QrCode className="text-purple-400" size={28} />
            Station Deployment & QR Access
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Bind controlled work instructions to physical workstations, lines, and generate QR code access tags for shop-floor tablet scanners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => {
              if (wis.length > 0 && !newDeploy.wi_id) {
                setNewDeploy({ ...newDeploy, wi_id: wis[0].id });
              }
              setShowAddModal(true);
            }}
            className="px-4 py-2 text-xs md:text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg shadow-md flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            New Station Mapping
          </button>
        </div>
      </div>

      {/* Deployments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading Station Deployments...</div>
        ) : deployments.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-slate-800/40 rounded-xl border border-slate-700/60 p-8 space-y-3">
            <QrCode size={36} className="mx-auto text-slate-500" />
            <h3 className="text-base font-bold text-white">No Active Station Deployments</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Assign approved work instructions to production line stations to generate operator QR codes.
            </p>
          </div>
        ) : (
          deployments.map((dep) => {
            const operatorUrl = `${window.location.origin}/#/digital-wi/operator/${dep.wi_id}?station=${encodeURIComponent(dep.station_id)}`;

            return (
              <div
                key={dep.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all shadow-md"
              >
                <div>
                  {/* Station Badge & Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800 flex items-center gap-1 w-max">
                        <MapPin size={12} /> {dep.station_id}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-2">{dep.station_name || dep.station_id}</h3>
                      <div className="text-xs text-slate-400">{dep.line_name} • {dep.process_code}</div>
                    </div>

                    <button
                      onClick={() => handleDeleteDeployment(dep.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete assignment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Bound WI details */}
                  <div className="mt-4 bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-emerald-400 font-bold">{dep.doc_number}</span>
                      <span className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                        {dep.active_revision}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 line-clamp-1">{dep.title}</div>
                  </div>

                  {/* QR Code Preview */}
                  <div className="mt-4 flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="bg-white p-2 rounded">
                      <QRCodeSVG value={operatorUrl} size={70} />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-slate-200">Scan to Launch</div>
                      <div className="text-[11px] text-slate-400">Direct Kiosk Link</div>
                      <button
                        onClick={() => setPlacardModal({ ...dep, qrUrl: operatorUrl })}
                        className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 font-medium mt-1"
                      >
                        <Printer size={12} /> Print Placard
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Deployed {new Date(dep.deployed_at).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => navigate(`/digital-wi/operator/${dep.wi_id}?station=${encodeURIComponent(dep.station_id)}`)}
                    className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <PlayCircle size={13} />
                    Launch Kiosk
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Deployment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="text-purple-400" size={20} />
                Deploy WI to Workstation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Link an approved work instruction to a production shop-floor terminal.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Work Instruction *</label>
                <select
                  value={newDeploy.wi_id}
                  onChange={(e) => setNewDeploy({ ...newDeploy, wi_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200"
                >
                  <option value="">-- Choose Approved / Published WI --</option>
                  {wis.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{w.doc_number}] {w.title} ({w.current_revision}) - {w.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Station ID (Code) *</label>
                <input
                  type="text"
                  value={newDeploy.station_id}
                  onChange={(e) => setNewDeploy({ ...newDeploy, station_id: e.target.value })}
                  placeholder="e.g. Station-ASSY-01"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Station Name</label>
                <input
                  type="text"
                  value={newDeploy.station_name}
                  onChange={(e) => setNewDeploy({ ...newDeploy, station_name: e.target.value })}
                  placeholder="e.g. Main Piston Sub-Assembly Cell #1"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Production Line</label>
                <input
                  type="text"
                  value={newDeploy.line_name}
                  onChange={(e) => setNewDeploy({ ...newDeploy, line_name: e.target.value })}
                  placeholder="e.g. Hydraulics Assembly Line A"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700 flex justify-end gap-2.5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeployment}
                className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded shadow-md"
              >
                Deploy & Generate QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placard Print Modal */}
      {placardModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="text-center border-b pb-3">
              <div className="text-xs font-bold tracking-widest uppercase text-slate-500">
                MAVI MES — PRODUCTION STATION TAG
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">{placardModal.station_id}</h3>
              <p className="text-xs text-slate-600">{placardModal.station_name}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border flex flex-col items-center justify-center">
              <QRCodeSVG value={placardModal.qrUrl} size={180} />
              <p className="text-[11px] font-mono text-slate-500 mt-3 text-center">
                Scan with Mandor Kiosk or Frontline Tablet to load active WI
              </p>
            </div>

            <div className="text-xs space-y-1 font-mono border-t pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Doc Number:</span>
                <span className="font-bold text-slate-800">{placardModal.doc_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Revision:</span>
                <span className="font-bold text-slate-800">{placardModal.active_revision}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Line:</span>
                <span className="text-slate-700">{placardModal.line_name}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setPlacardModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center gap-1.5"
              >
                <Printer size={14} /> Print Placard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
