/**
 * digitalWiDB.js
 * ============================================================================
 * Enterprise Database & Storage Layer for MAVI Digital Work Instructions (WI)
 * Supports Supabase remote persistence with automatic localStorage fallback.
 * Includes complete lifecycle, revisions, steps with checkpoints, deployments,
 * operator execution records, and ISO 9001 compliant audit trails.
 * ============================================================================
 */

import { getSupabaseAuth } from './supabaseAuth';

const getClient = () => {
  try {
    const c = getSupabaseAuth();
    return c && typeof c.from === 'function' ? c : null;
  } catch (e) {
    return null;
  }
};

const STORAGE_KEYS = {
  WIS: 'mavi_digital_wis_v1',
  REVISIONS: 'mavi_digital_wi_revisions_v1',
  DEPLOYMENTS: 'mavi_digital_wi_deployments_v1',
  EXECUTIONS: 'mavi_digital_wi_executions_v1',
  AUDIT_LOGS: 'mavi_digital_wi_audit_logs_v1'
};

// Seed Enterprise Work Instructions
const DEFAULT_INITIAL_WIS = [
  {
    id: 'wi-hc-100-assy',
    doc_number: 'WI-ASSY-001',
    title: 'Hydraulic Cylinder Main Piston Assembly',
    part_number: 'HC-100-PRO',
    part_name: 'Heavy-Duty 100mm Hydraulic Cylinder',
    process_name: 'Piston Rod & Seal Assembly',
    department: 'Hydraulics Line A',
    current_revision: 'Rev B',
    status: 'Published',
    description: 'Standard operating instruction for assembling high-pressure seals, piston shaft, and end-cap with specified torque limits.',
    source_pdf_name: 'WI-ASSY-001_Hydraulic_Cylinder.pdf',
    created_by: 'Senior Manufacturing Engineer (Bambang S.)',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    revisions: [
      {
        revision: 'Rev A',
        status: 'Superseded',
        author: 'Bambang S.',
        approver: 'Quality Head (Dedi R.)',
        approval_date: new Date(Date.now() - 86400000 * 30).toISOString(),
        published_date: new Date(Date.now() - 86400000 * 28).toISOString(),
        change_summary: 'Initial release'
      },
      {
        revision: 'Rev B',
        status: 'Published',
        author: 'Bambang S.',
        approver: 'Quality Head (Dedi R.)',
        approval_date: new Date(Date.now() - 86400000 * 3).toISOString(),
        published_date: new Date(Date.now() - 86400000 * 2).toISOString(),
        change_summary: 'Updated O-ring lubrication spec to ISO VG 46 and tightened torque tolerance to 45 +/- 2 Nm.'
      }
    ],
    steps: [
      {
        id: 'step-1',
        step_number: 1,
        title: 'Component Inspection & Cleanliness Check',
        instruction: 'Inspect the cylinder bore and piston rod for surface scratches or burrs. Ensure cleaning solvent residue is dry and contamination-free before assembling seals.',
        source_pages: [1],
        cycle_time_target_sec: 45,
        tools: ['Lint-free Industrial Wipe', 'Bore Scope / Inspection Lamp'],
        materials: ['Iso-Propyl Alcohol 99%', 'Piston Rod HC-100'],
        safety_warnings: ['Wear Nitrile Chemical Gloves', 'Inspect in well-ventilated booth'],
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
        checkpoints: [
          {
            id: 'cp-1-1',
            type: 'scan_code',
            label: 'Scan Cylinder Serial Barcode / QR',
            expected_prefix: 'HC-',
            required: true
          },
          {
            id: 'cp-1-2',
            type: 'checklist',
            label: 'Bore inner diameter free of scratches or metal chips',
            required: true
          }
        ]
      },
      {
        id: 'step-2',
        step_number: 2,
        title: 'Install Piston Head O-Ring & Backup Ring',
        instruction: 'Apply a light coating of hydraulic oil (ISO VG 46) around the seal groove. Gently expand the PTFE piston seal using the guide cone tool. Ensure no twisting or crimping of the elastomeric quad-ring.',
        source_pages: [2],
        cycle_time_target_sec: 60,
        tools: ['Seal Installation Guide Cone #4', 'Plastic Non-marring Pick'],
        materials: ['PTFE Piston Seal Ø100mm', 'NBR 70 Shore Quad-Ring', 'ISO VG 46 Hydraulic Fluid'],
        safety_warnings: ['Do NOT use metal screwdrivers to seat the seal — risks severe leak defect'],
        images: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'],
        checkpoints: [
          {
            id: 'cp-2-1',
            type: 'checklist',
            label: 'Lubricant uniformly applied to seal groove',
            required: true
          },
          {
            id: 'cp-2-2',
            type: 'ok_ng',
            label: 'Visual check: Seal seated flat without twist or distortion',
            required: true
          }
        ]
      },
      {
        id: 'step-3',
        step_number: 3,
        title: 'Torque Cylinder End-Cap Retaining Bolts',
        instruction: 'Thread the 6x M10 grade 10.9 flange bolts in cross-pattern. Use digital torque wrench calibrated per ISO 6789. Torque each bolt progressively to 45.0 Nm.',
        source_pages: [3],
        cycle_time_target_sec: 90,
        tools: ['Digital Torque Wrench 10-60 Nm (Calibrated)', '17mm Hex Socket'],
        materials: ['6x M10x35 Flange Bolts Gr 10.9', 'Threadlocker Loctite 243 (Medium)'],
        safety_warnings: ['Ensure torque wrench calibration sticker is valid within current month'],
        images: ['https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'],
        checkpoints: [
          {
            id: 'cp-3-1',
            type: 'numeric',
            label: 'Measured Torque on Bolt #1',
            unit: 'Nm',
            min: 43.0,
            max: 47.0,
            nominal: 45.0,
            required: true
          },
          {
            id: 'cp-3-2',
            type: 'numeric',
            label: 'Measured Torque on Bolt #4 (Cross bolt)',
            unit: 'Nm',
            min: 43.0,
            max: 47.0,
            nominal: 45.0,
            required: true
          },
          {
            id: 'cp-3-3',
            type: 'checklist',
            label: 'All 6 bolts torqued in cross-pattern and marked with QA paint',
            required: true
          }
        ]
      },
      {
        id: 'step-4',
        step_number: 4,
        title: 'Hydrostatic Pressure & Leak Test',
        instruction: 'Connect pressure test rig. Ramp pressure to 210 bar (3045 psi) and hold for 30 seconds. Inspect rod seal gland and cylinder tube weld seams for any weeping or fluid droplets.',
        source_pages: [4],
        cycle_time_target_sec: 120,
        tools: ['Hydrostatic Pressure Test Rig (Station-HYD-01)', 'Pressure Transducer Display'],
        materials: ['Hydraulic Test Oil ISO VG 32'],
        safety_warnings: ['KEEP BEHIND POLYCARBONATE SHIELD during 210 bar pressure test', 'Do not touch fittings under pressure'],
        images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'],
        checkpoints: [
          {
            id: 'cp-4-1',
            type: 'numeric',
            label: 'Holding Test Pressure (bar)',
            unit: 'bar',
            min: 205.0,
            max: 220.0,
            nominal: 210.0,
            required: true
          },
          {
            id: 'cp-4-2',
            type: 'ok_ng',
            label: 'Zero pressure drop & zero fluid leakage detected',
            required: true
          }
        ]
      }
    ]
  },
  {
    id: 'wi-inv-200-pcb',
    doc_number: 'WI-ELEC-004',
    title: 'Industrial Inverter Power PCB & Heatsink Mounting',
    part_number: 'INV-450-PCB',
    part_name: '45kW Inverter Gate Driver Board Assembly',
    process_name: 'Thermal Interface & Torquing',
    department: 'Electronics SMT & Sub-Assembly',
    current_revision: 'Rev A',
    status: 'Approved',
    description: 'Work instruction for applying thermal grease screen and securing IGBT power module with automated torque screwdriver.',
    source_pdf_name: 'WI-ELEC-004_Inverter_PCB.pdf',
    created_by: 'Process Engineer (Rian Pratama)',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    revisions: [
      {
        revision: 'Rev A',
        status: 'Approved',
        author: 'Rian Pratama',
        approver: 'Quality Engineering Mgr (Ratna K.)',
        approval_date: new Date(Date.now() - 86400000 * 1).toISOString(),
        published_date: null,
        change_summary: 'New product introduction (NPI) standard instruction.'
      }
    ],
    steps: [
      {
        id: 'step-inv-1',
        step_number: 1,
        title: 'ESD Protection & IGBT Visual Check',
        instruction: 'Attach ESD wrist strap and verify ground resistance < 1 MOhm. Inspect IGBT terminals for coplanarity and check ceramic substrate for cracks.',
        source_pages: [1],
        cycle_time_target_sec: 30,
        tools: ['ESD Wrist Strap Tester', 'Magnifying Lamp 5x'],
        materials: ['IGBT Power Module 1200V 300A'],
        safety_warnings: ['ESD Sensitive Device (Class 1) — Do NOT touch gate pins with bare hands'],
        images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'],
        checkpoints: [
          {
            id: 'cp-e-1',
            type: 'checklist',
            label: 'ESD ground continuity verified green',
            required: true
          },
          {
            id: 'cp-e-2',
            type: 'scan_code',
            label: 'Scan IGBT 2D DataMatrix code',
            required: true
          }
        ]
      },
      {
        id: 'step-inv-2',
        step_number: 2,
        title: 'Apply Thermal Interface Compound & Screw Fastening',
        instruction: 'Use stencil to apply 80-100 μm uniform layer of thermal grease to heatsink base. Fasten 4x M4 torx screws with electric screwdriver set to 2.2 Nm.',
        source_pages: [2],
        cycle_time_target_sec: 50,
        tools: ['Thermal Stencil & Squeegee', 'Torque Controlled Electric Screwdriver (2.2 Nm)'],
        materials: ['Thermal Compound Dow Corning TC-5026', '4x M4x12 Torx Screws'],
        safety_warnings: ['Avoid grease contact with board connectors'],
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
        checkpoints: [
          {
            id: 'cp-e-3',
            type: 'numeric',
            label: 'Screw Fastening Torque (Nm)',
            unit: 'Nm',
            min: 2.0,
            max: 2.4,
            nominal: 2.2,
            required: true
          },
          {
            id: 'cp-e-4',
            type: 'ok_ng',
            label: 'Check grease squeeze-out line uniform around periphery',
            required: true
          }
        ]
      }
    ]
  },
  {
    id: 'wi-brake-300-caliper',
    doc_number: 'WI-MECH-012',
    title: 'Automotive Disc Brake Caliper Final Verification',
    part_number: 'BRK-CAL-300',
    part_name: 'Ventilated Dual-Piston Brake Caliper',
    process_name: 'Fluid Seal & Slide Pin Assembly',
    department: 'Chassis Line 2',
    current_revision: 'Rev C',
    status: 'Pending Approval',
    description: 'Updated draft revising slide pin silicone grease specification and digital dial gauge run-out limit.',
    source_pdf_name: 'WI-MECH-012_Brake_Caliper.pdf',
    created_by: 'QA Engineer (Irfan Hakim)',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    revisions: [
      {
        revision: 'Rev B',
        status: 'Superseded',
        author: 'Irfan Hakim',
        approver: 'Plant QA Manager',
        approval_date: new Date(Date.now() - 86400000 * 40).toISOString(),
        published_date: new Date(Date.now() - 86400000 * 38).toISOString(),
        change_summary: 'Baseline revision'
      },
      {
        revision: 'Rev C',
        status: 'Pending Approval',
        author: 'Irfan Hakim',
        approver: null,
        approval_date: null,
        published_date: null,
        change_summary: 'Added digital micrometer caliper thickness verification checkpoint.'
      }
    ],
    steps: [
      {
        id: 'step-brk-1',
        step_number: 1,
        title: 'Measure Caliper Gland Width with Digital Micrometer',
        instruction: 'Measure caliper opening gap at 3 points using calibrated external micrometer. Confirm gap meets 32.50 +/- 0.08 mm tolerance before bracket insertion.',
        source_pages: [1],
        cycle_time_target_sec: 40,
        tools: ['Mitutoyo 25-50mm Digimatic Micrometer', 'Zero Setting Block'],
        materials: ['Cast Ductile Iron Caliper Housing'],
        safety_warnings: ['Wear safety shoes and cut-resistant gloves Level 5'],
        images: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'],
        checkpoints: [
          {
            id: 'cp-b-1',
            type: 'numeric',
            label: 'Caliper Gap Point A (mm)',
            unit: 'mm',
            min: 32.42,
            max: 32.58,
            nominal: 32.50,
            required: true
          },
          {
            id: 'cp-b-2',
            type: 'numeric',
            label: 'Caliper Gap Point B (mm)',
            unit: 'mm',
            min: 32.42,
            max: 32.58,
            nominal: 32.50,
            required: true
          }
        ]
      }
    ]
  }
];

// Seed Station Deployments
const DEFAULT_INITIAL_DEPLOYMENTS = [
  {
    id: 'dep-stat-01',
    wi_id: 'wi-hc-100-assy',
    doc_number: 'WI-ASSY-001',
    title: 'Hydraulic Cylinder Main Piston Assembly',
    station_id: 'Station-ASSY-01',
    station_name: 'Piston Sub-Assembly Cell #1',
    line_name: 'Hydraulics Assembly Line A',
    process_code: 'ASY-HYD-01',
    active_revision: 'Rev B',
    access_token: 'tok-assy01-revb',
    is_active: true,
    deployed_by: 'Bambang S. (Engineer)',
    deployed_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'dep-stat-02',
    wi_id: 'wi-hc-100-assy',
    doc_number: 'WI-ASSY-001',
    title: 'Hydraulic Cylinder Main Piston Assembly',
    station_id: 'Station-TEST-02',
    station_name: 'Hydrostatic Pressure & Leak Station',
    line_name: 'Hydraulics Assembly Line A',
    process_code: 'TEST-HYD-02',
    active_revision: 'Rev B',
    access_token: 'tok-test02-revb',
    is_active: true,
    deployed_by: 'Bambang S. (Engineer)',
    deployed_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Seed Operator Execution Records
const DEFAULT_INITIAL_EXECUTIONS = [
  {
    id: 'exec-101',
    wi_id: 'wi-hc-100-assy',
    doc_number: 'WI-ASSY-001',
    title: 'Hydraulic Cylinder Main Piston Assembly',
    revision: 'Rev B',
    station_id: 'Station-ASSY-01',
    work_order_id: 'WO-2026-0891',
    serial_number: 'HC-SN-89410',
    part_number: 'HC-100-PRO',
    operator_name: 'Agus Santoso (OP-04)',
    status: 'Completed',
    start_time: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    completion_time: new Date(Date.now() - 3600000 * 2.1).toISOString(),
    duration_seconds: 1440,
    overall_quality: 'PASS',
    defect_notes: '',
    step_results: [
      { step_number: 1, checkpoints: [{ id: 'cp-1-1', value: 'HC-SN-89410', status: 'PASS' }, { id: 'cp-1-2', value: true, status: 'PASS' }] },
      { step_number: 2, checkpoints: [{ id: 'cp-2-1', value: true, status: 'PASS' }, { id: 'cp-2-2', value: 'OK', status: 'PASS' }] },
      { step_number: 3, checkpoints: [{ id: 'cp-3-1', value: 45.2, status: 'PASS' }, { id: 'cp-3-2', value: 44.9, status: 'PASS' }, { id: 'cp-3-3', value: true, status: 'PASS' }] },
      { step_number: 4, checkpoints: [{ id: 'cp-4-1', value: 210.5, status: 'PASS' }, { id: 'cp-4-2', value: 'OK', status: 'PASS' }] }
    ],
    created_at: new Date(Date.now() - 3600000 * 2.1).toISOString()
  },
  {
    id: 'exec-102',
    wi_id: 'wi-hc-100-assy',
    doc_number: 'WI-ASSY-001',
    revision: 'Rev B',
    station_id: 'Station-ASSY-01',
    work_order_id: 'WO-2026-0892',
    serial_number: 'HC-SN-89411',
    part_number: 'HC-100-PRO',
    operator_name: 'Budi Wibowo (OP-08)',
    status: 'Completed',
    start_time: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    completion_time: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    duration_seconds: 1390,
    overall_quality: 'PASS',
    defect_notes: '',
    step_results: [
      { step_number: 1, checkpoints: [{ id: 'cp-1-1', value: 'HC-SN-89411', status: 'PASS' }, { id: 'cp-1-2', value: true, status: 'PASS' }] },
      { step_number: 2, checkpoints: [{ id: 'cp-2-1', value: true, status: 'PASS' }, { id: 'cp-2-2', value: 'OK', status: 'PASS' }] },
      { step_number: 3, checkpoints: [{ id: 'cp-3-1', value: 45.8, status: 'PASS' }, { id: 'cp-3-2', value: 45.1, status: 'PASS' }, { id: 'cp-3-3', value: true, status: 'PASS' }] },
      { step_number: 4, checkpoints: [{ id: 'cp-4-1', value: 209.8, status: 'PASS' }, { id: 'cp-4-2', value: 'OK', status: 'PASS' }] }
    ],
    created_at: new Date(Date.now() - 3600000 * 0.8).toISOString()
  }
];

export const digitalWiDB = {
  // --------------------------------------------------------------------------
  // Work Instructions CRUD
  // --------------------------------------------------------------------------
  async getWorkInstructions(filters = {}) {
    try {
      const client = getClient();
      if (client) {
        let query = client.from('work_instructions').select('*');
        if (filters.status && filters.status !== 'ALL') query = query.eq('status', filters.status);
        if (filters.search) query = query.ilike('title', `%${filters.search}%`);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('[digitalWiDB] Supabase query fallback to local:', e.message);
    }

    // LocalStorage fallback
    const raw = localStorage.getItem(STORAGE_KEYS.WIS);
    let list = raw ? JSON.parse(raw) : DEFAULT_INITIAL_WIS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WIS, JSON.stringify(DEFAULT_INITIAL_WIS));
    }

    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(item => item.status?.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(item => 
        item.title?.toLowerCase().includes(q) ||
        item.doc_number?.toLowerCase().includes(q) ||
        item.part_number?.toLowerCase().includes(q) ||
        item.process_name?.toLowerCase().includes(q) ||
        item.department?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getWorkInstructionById(id) {
    if (!id) return null;
    const list = await this.getWorkInstructions();
    return list.find(item => item.id === id || item.doc_number === id) || null;
  },

  async saveWorkInstruction(wi) {
    const list = await this.getWorkInstructions();
    const existingIndex = list.findIndex(item => item.id === wi.id);
    const updated = {
      ...wi,
      id: wi.id || `wi-${Date.now()}`,
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updated;
    } else {
      updated.created_at = updated.created_at || new Date().toISOString();
      list.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.WIS, JSON.stringify(list));

    // Also write audit log
    await this.logAudit(updated.id, updated.doc_number, existingIndex >= 0 ? 'EDITED' : 'CREATED', wi.created_by || 'Engineer', {
      revision: updated.current_revision,
      status: updated.status,
      title: updated.title
    });

    try {
      const client = getClient();
      if (client) {
        await client.from('work_instructions').upsert(updated);
      }
    } catch (e) {
      // ignore offline error
    }

    return updated;
  },

  async deleteWorkInstruction(id) {
    const list = await this.getWorkInstructions();
    const target = list.find(item => item.id === id);
    const filtered = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.WIS, JSON.stringify(filtered));

    if (target) {
      await this.logAudit(id, target.doc_number, 'DELETED', 'Engineer', { title: target.title });
    }

    try {
      const client = getClient();
      if (client) {
        await client.from('work_instructions').delete().eq('id', id);
      }
    } catch (e) {
      // ignore
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // Lifecycle Transitions
  // --------------------------------------------------------------------------
  async submitForApproval(id, authorName = 'Engineer') {
    const wi = await this.getWorkInstructionById(id);
    if (!wi) throw new Error('Work Instruction not found');

    wi.status = 'Pending Approval';
    wi.updated_at = new Date().toISOString();

    // Update revision entry
    if (!wi.revisions) wi.revisions = [];
    const revEntry = wi.revisions.find(r => r.revision === wi.current_revision);
    if (revEntry) {
      revEntry.status = 'Pending Approval';
      revEntry.author = authorName;
    } else {
      wi.revisions.push({
        revision: wi.current_revision,
        status: 'Pending Approval',
        author: authorName,
        change_summary: 'Submitted for managerial approval.'
      });
    }

    await this.saveWorkInstruction(wi);
    await this.logAudit(id, wi.doc_number, 'SUBMITTED_FOR_APPROVAL', authorName, { revision: wi.current_revision });
    return wi;
  },

  async approveWorkInstruction(id, approverName = 'Quality Manager', comments = 'Approved per ISO 9001 standard.') {
    const wi = await this.getWorkInstructionById(id);
    if (!wi) throw new Error('Work Instruction not found');

    wi.status = 'Approved';
    wi.updated_at = new Date().toISOString();

    const revEntry = wi.revisions?.find(r => r.revision === wi.current_revision);
    if (revEntry) {
      revEntry.status = 'Approved';
      revEntry.approver = approverName;
      revEntry.approval_date = new Date().toISOString();
      revEntry.comments = comments;
    }

    await this.saveWorkInstruction(wi);
    await this.logAudit(id, wi.doc_number, 'APPROVED', approverName, { revision: wi.current_revision, comments });
    return wi;
  },

  async rejectWorkInstruction(id, approverName = 'Quality Manager', reason = 'Clarification needed on torque range.') {
    const wi = await this.getWorkInstructionById(id);
    if (!wi) throw new Error('Work Instruction not found');

    wi.status = 'Draft';
    wi.updated_at = new Date().toISOString();

    const revEntry = wi.revisions?.find(r => r.revision === wi.current_revision);
    if (revEntry) {
      revEntry.status = 'Draft';
      revEntry.rejection_reason = reason;
    }

    await this.saveWorkInstruction(wi);
    await this.logAudit(id, wi.doc_number, 'REJECTED', approverName, { revision: wi.current_revision, reason });
    return wi;
  },

  async publishWorkInstruction(id, publisherName = 'Operations Head') {
    const wi = await this.getWorkInstructionById(id);
    if (!wi) throw new Error('Work Instruction not found');

    wi.status = 'Published';
    wi.updated_at = new Date().toISOString();

    // Mark previous revisions as Superseded
    if (wi.revisions) {
      wi.revisions.forEach(r => {
        if (r.revision === wi.current_revision) {
          r.status = 'Published';
          r.published_date = new Date().toISOString();
        } else if (r.status === 'Published') {
          r.status = 'Superseded';
        }
      });
    }

    await this.saveWorkInstruction(wi);
    await this.logAudit(id, wi.doc_number, 'PUBLISHED', publisherName, { revision: wi.current_revision });
    return wi;
  },

  async createNewRevision(id, authorName = 'Engineer', changeSummary = 'Engineering change order (ECO)') {
    const wi = await this.getWorkInstructionById(id);
    if (!wi) throw new Error('Work Instruction not found');

    // Determine next letter
    const currentRevStr = wi.current_revision || 'Rev A';
    const match = currentRevStr.match(/Rev\s*([A-Z])/i);
    let nextLetter = 'B';
    if (match) {
      const code = match[1].toUpperCase().charCodeAt(0);
      nextLetter = String.fromCharCode(code + 1);
    }
    const nextRev = `Rev ${nextLetter}`;

    // Mark current revision as superseding or superseded
    wi.current_revision = nextRev;
    wi.status = 'Draft';
    wi.updated_at = new Date().toISOString();

    if (!wi.revisions) wi.revisions = [];
    wi.revisions.push({
      revision: nextRev,
      status: 'Draft',
      author: authorName,
      created_at: new Date().toISOString(),
      change_summary: changeSummary
    });

    await this.saveWorkInstruction(wi);
    await this.logAudit(id, wi.doc_number, 'NEW_REVISION_CREATED', authorName, { from: currentRevStr, to: nextRev });
    return wi;
  },

  // --------------------------------------------------------------------------
  // Station Deployments
  // --------------------------------------------------------------------------
  async getDeployments() {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPLOYMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEPLOYMENTS, JSON.stringify(DEFAULT_INITIAL_DEPLOYMENTS));
      return DEFAULT_INITIAL_DEPLOYMENTS;
    }
    return JSON.parse(raw);
  },

  async saveDeployment(deployment) {
    const list = await this.getDeployments();
    const existingIndex = list.findIndex(d => d.id === deployment.id);
    const updated = {
      ...deployment,
      id: deployment.id || `dep-${Date.now()}`,
      access_token: deployment.access_token || `tok-${Math.random().toString(36).substring(2, 9)}`,
      deployed_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updated;
    } else {
      list.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.DEPLOYMENTS, JSON.stringify(list));
    await this.logAudit(updated.wi_id, updated.doc_number, 'STATION_DEPLOYED', updated.deployed_by || 'Engineer', {
      station_id: updated.station_id,
      revision: updated.active_revision
    });
    return updated;
  },

  async deleteDeployment(id) {
    const list = await this.getDeployments();
    const filtered = list.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DEPLOYMENTS, JSON.stringify(filtered));
    return true;
  },

  // --------------------------------------------------------------------------
  // Operator Executions (Production Records)
  // --------------------------------------------------------------------------
  async getExecutions(filters = {}) {
    const raw = localStorage.getItem(STORAGE_KEYS.EXECUTIONS);
    let list = raw ? JSON.parse(raw) : DEFAULT_INITIAL_EXECUTIONS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(DEFAULT_INITIAL_EXECUTIONS));
    }

    if (filters.station_id) {
      list = list.filter(e => e.station_id === filters.station_id);
    }
    if (filters.wi_id) {
      list = list.filter(e => e.wi_id === filters.wi_id);
    }
    if (filters.quality) {
      list = list.filter(e => e.overall_quality === filters.quality);
    }
    return list;
  },

  async saveExecution(executionRecord) {
    const list = await this.getExecutions();
    const existingIndex = list.findIndex(e => e.id === executionRecord.id);
    const updated = {
      ...executionRecord,
      id: executionRecord.id || `exec-${Date.now()}`,
      created_at: executionRecord.created_at || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updated;
    } else {
      list.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(list));

    await this.logAudit(updated.wi_id, updated.doc_number, 'OPERATOR_EXECUTED', updated.operator_name, {
      serial: updated.serial_number,
      overall_quality: updated.overall_quality,
      station: updated.station_id
    });

    try {
      const client = getClient();
      if (client) {
        await client.from('work_instruction_executions').insert(updated);
      }
    } catch (e) {
      // ignore
    }

    return updated;
  },

  // --------------------------------------------------------------------------
  // Audit Trail & Metrics
  // --------------------------------------------------------------------------
  async logAudit(wiId, docNumber, action, userName, details = {}) {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const list = raw ? JSON.parse(raw) : [];
    const logItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      wi_id: wiId,
      doc_number: docNumber,
      action,
      user_name: userName,
      details,
      created_at: new Date().toISOString()
    };
    list.unshift(logItem);
    // Keep max 200 logs locally
    if (list.length > 200) list.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(list));
    return logItem;
  },

  async getAuditLogs(wiId = null) {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    let list = raw ? JSON.parse(raw) : [];
    if (wiId) {
      list = list.filter(l => l.wi_id === wiId);
    }
    return list;
  },

  async getDashboardMetrics() {
    const wis = await this.getWorkInstructions();
    const executions = await this.getExecutions();
    const deployments = await this.getDeployments();

    const metrics = {
      total: wis.length,
      draft: wis.filter(w => w.status === 'Draft').length,
      pending: wis.filter(w => w.status === 'Pending Approval').length,
      approved: wis.filter(w => w.status === 'Approved').length,
      published: wis.filter(w => w.status === 'Published').length,
      obsolete: wis.filter(w => w.status === 'Obsolete' || w.status === 'Superseded').length,
      totalDeployments: deployments.filter(d => d.is_active).length,
      recentExecutionsCount: executions.length,
      firstPassYield: executions.length > 0 
        ? Math.round((executions.filter(e => e.overall_quality === 'PASS').length / executions.length) * 100) 
        : 100
    };
    return metrics;
  }
};
