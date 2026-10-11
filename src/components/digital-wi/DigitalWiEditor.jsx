import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Layers, Wrench, ShieldAlert, CheckSquare, Hash, Scan, Image, 
  Check, X, Plus, Trash2, ArrowUp, ArrowDown, Copy, Save, Eye, 
  ArrowLeft, RefreshCw, FileText, Sliders, Settings2, PlayCircle, 
  Clock, Video, PenTool, Sparkles, AlertTriangle, ChevronRight, 
  HelpCircle, ShieldCheck, FileCode, CheckCircle2, Move, Type,
  AlertOctagon, Ruler, BarChart2, Radio, Info, Printer, Monitor,
  Grid, ZoomIn, ZoomOut, Maximize2, Layout, Columns
} from 'lucide-react';
import { digitalWiDB } from '../../utils/digitalWiDB';
import toast from 'react-hot-toast';

// Odoo Studio Brand Colors
const ODOO = {
  purple: '#714B67',
  purpleDark: '#56384e',
  purpleLight: '#fbf5f9',
  teal: '#00A09D',
  tealLight: '#e6f7f7',
  bgGray: '#f8f9fa',
  border: '#e2e8f0',
  textMain: '#212529',
  textMuted: '#6c757d'
};

// Manufacturing Paper Size & Orientation Standards
export const PAPER_CONFIGS = {
  A4: {
    id: 'A4',
    name: 'A4',
    dims: '210 × 297 mm',
    standard: 'ISO 216 Standard',
    portrait: {
      widthClass: 'w-[760px] max-w-full',
      minHeight: '1020px',
      aspectRatio: '210 / 297',
      label: 'A4 Portrait (210 × 297 mm)'
    },
    landscape: {
      widthClass: 'w-full max-w-[1140px]',
      minHeight: '720px',
      aspectRatio: '297 / 210',
      label: 'A4 Landscape (297 × 210 mm)'
    }
  },
  A3: {
    id: 'A3',
    name: 'A3',
    dims: '297 × 420 mm',
    standard: 'ISO 216 Shopfloor Wide',
    portrait: {
      widthClass: 'w-[860px] max-w-full',
      minHeight: '1180px',
      aspectRatio: '297 / 420',
      label: 'A3 Portrait (297 × 420 mm)'
    },
    landscape: {
      widthClass: 'w-full max-w-[1280px]',
      minHeight: '820px',
      aspectRatio: '420 / 297',
      label: 'A3 Landscape (420 × 297 mm)'
    }
  },
  Letter: {
    id: 'Letter',
    name: 'Letter',
    dims: '8.5 × 11 in',
    standard: 'ANSI A Standard',
    portrait: {
      widthClass: 'w-[760px] max-w-full',
      minHeight: '980px',
      aspectRatio: '8.5 / 11',
      label: 'Letter Portrait (8.5 × 11 in)'
    },
    landscape: {
      widthClass: 'w-full max-w-[1080px]',
      minHeight: '700px',
      aspectRatio: '11 / 8.5',
      label: 'Letter Landscape (11 × 8.5 in)'
    }
  },
  '16:9': {
    id: '16:9',
    name: '16:9 Screen',
    dims: '1920 × 1080 px',
    standard: 'Digital Kiosk / Tablet',
    portrait: {
      widthClass: 'w-[560px] max-w-full',
      minHeight: '960px',
      aspectRatio: '9 / 16',
      label: '16:9 Portrait (Vertical Terminal)'
    },
    landscape: {
      widthClass: 'w-full max-w-[1200px]',
      minHeight: '675px',
      aspectRatio: '16 / 9',
      label: '16:9 Landscape (Widescreen Touch)'
    }
  }
};

// Available WI Widgets in the Odoo Builder Suite
const WIDGET_CATALOG = [
  {
    category: 'Instructions & Safety (K3)',
    items: [
      {
        type: 'INSTRUCTION_BOX',
        name: 'Step Instructions',
        icon: Type,
        desc: 'Detailed guided operational text and step badges',
        defaultProps: {
          title: 'Operation Guidance',
          text: 'Perform the specified mechanical assembly per blueprint tolerance.',
          fontSize: 'text-base',
          highlight: false
        }
      },
      {
        type: 'CALLOUT_ALERT',
        name: 'Safety Warning (K3)',
        icon: ShieldAlert,
        desc: 'OSHA / ISO 45001 safety precaution callout',
        defaultProps: {
          level: 'WARNING', // DANGER, WARNING, INFO
          title: 'Critical Safety Precaution',
          text: 'Wear safety goggles and Level 5 cut-resistant gloves during this operation.'
        }
      },
      {
        type: 'TOOLS_MATERIALS',
        name: 'Tools & Materials Pills',
        icon: Wrench,
        desc: 'Interactive badge list of required tools and parts',
        defaultProps: {
          tools: ['Calibrated Torque Wrench (10-60 Nm)', 'Inspection Mirror'],
          materials: ['Viton O-Ring Seal Ø24mm', 'M8 Flange Bolt']
        }
      }
    ]
  },
  {
    category: 'Quality & Metrology Checkpoints',
    items: [
      {
        type: 'NUMERIC_TOLERANCE',
        name: 'Numeric Measurement',
        icon: Ruler,
        desc: 'Min/Nominal/Max tolerance inspection with pass/fail bar',
        defaultProps: {
          label: 'Torque Fastening Verification',
          unit: 'Nm',
          nominal: 45.0,
          min: 43.0,
          max: 47.0,
          required: true
        }
      },
      {
        type: 'INSPECTION_OK_NG',
        name: 'Visual OK / NG Decision',
        icon: CheckCircle2,
        desc: 'High-contrast touch buttons with mandatory defect note on NG',
        defaultProps: {
          label: 'Visual check: Seal seated flat without twist or crimping',
          required: true,
          requireReasonOnNg: true
        }
      },
      {
        type: 'CHECKLIST_TASK',
        name: 'Mandatory Task Checklist',
        icon: CheckSquare,
        desc: 'Confirmation checkbox operator must tick to advance',
        defaultProps: {
          label: 'Bore inner diameter verified clean and contamination-free',
          required: true
        }
      },
      {
        type: 'SIGNATURE_PAD',
        name: 'Operator Sign-off',
        icon: PenTool,
        desc: 'Digital touch signature for final QA sign-off',
        defaultProps: {
          label: 'Quality Inspector Sign-off',
          required: true
        }
      }
    ]
  },
  {
    category: 'Hardware & Traceability',
    items: [
      {
        type: 'BARCODE_SCANNER',
        name: 'Barcode / 2D Scanner',
        icon: Scan,
        desc: 'Serial number capture with prefix validation',
        defaultProps: {
          label: 'Scan Work Order / Part 2D DataMatrix',
          prefix: 'HC-',
          required: true
        }
      },
      {
        type: 'MEDIA_VIEWER',
        name: 'CAD / Drawing Preview',
        icon: Image,
        desc: 'High-resolution blueprint image or CAD cross-section',
        defaultProps: {
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          caption: 'Exploded view of piston seal seating groove'
        }
      }
    ]
  }
];

// Helper for PowerPoint-style Free-size widget widths
export const getWidgetWidthStyle = (layout) => {
  const w = layout?.width || '100%';
  if (w === '100%') return '100%';
  if (w === '50%') return 'calc(50% - 8px)';
  if (w === '33.33%' || w === '33%') return 'calc(33.333% - 11px)';
  if (w === '25%') return 'calc(25% - 12px)';
  if (w === '66.66%' || w === '66%') return 'calc(66.666% - 8px)';
  if (w === '75%') return 'calc(75% - 8px)';
  return w; // custom px or %
};

export default function DigitalWiEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [wi, setWi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [leftTab, setLeftTab] = useState('steps'); // 'steps' | 'widgets'
  const [isSaving, setIsSaving] = useState(false);
  const [resizing, setResizing] = useState(null);
  const [canvasSettings, setCanvasSettings] = useState({
    showGrid: false,
    showMargins: true,
    zoom: 100, // 75, 100, 125
    layoutCols: 'auto', // 'auto' | 1 | 2
    titleBlockStyle: 'iso_header' // 'iso_header' | 'minimal' | 'none'
  });
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printScope, setPrintScope] = useState('all'); // 'all' | 'current'

  useEffect(() => {
    loadWi();
  }, [id]);

  const loadWi = async () => {
    setLoading(true);
    try {
      if (id) {
        const found = await digitalWiDB.getWorkInstructionById(id);
        if (found) {
          const hydrated = hydrateWiWithWidgets(found);
          setWi(hydrated);
        } else {
          toast.error('Instruksi kerja tidak ditemukan');
          navigate('/digital-wi/library');
        }
      } else {
        // Blank Template
        const blankWi = {
          id: `wi-${Date.now()}`,
          doc_number: `WI-NEW-${Math.floor(100 + Math.random() * 900)}`,
          title: 'New Assembly Work Instruction',
          part_number: 'PRT-001',
          part_name: 'Manufactured Sub-Assembly',
          process_name: 'Standard Assembly Operation',
          department: 'Assembly Line 1',
          current_revision: 'Rev A',
          paper_size: 'A4',
          paper_orientation: 'landscape',
          status: 'Draft',
          description: 'Standard operating instruction built with MAVI WI Odoo Studio.',
          revisions: [
            {
              revision: 'Rev A',
              status: 'Draft',
              author: 'Manufacturing Engineer',
              created_at: new Date().toISOString(),
              change_summary: 'Initial draft in WI Studio'
            }
          ],
          steps: [
            {
              id: 'step-1',
              step_number: 1,
              title: 'Preparation & Incoming Part Inspection',
              instruction: 'Clean work surface and inspect incoming parts before beginning assembly.',
              source_pages: [1],
              tools: ['Safety Gloves', 'Inspection Lamp'],
              materials: ['Main Cylinder Housing'],
              safety_warnings: ['Wear safety glasses and protective footwear.'],
              cycle_time_target_sec: 45,
              images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
              checkpoints: [
                { id: 'cp-1', type: 'scan_code', label: 'Scan Work Order Barcode', required: true },
                { id: 'cp-2', type: 'checklist', label: 'Bore inner diameter free of scratches', required: true }
              ]
            }
          ]
        };
        setWi(hydrateWiWithWidgets(blankWi));
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat dokumen WI');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hydrates standard steps with visual widget representations for the canvas
   */
  const hydrateWiWithWidgets = (sourceWi) => {
    const cloned = JSON.parse(JSON.stringify(sourceWi));
    if (!cloned.paper_size) cloned.paper_size = 'A4';
    if (!cloned.paper_orientation) cloned.paper_orientation = 'landscape';
    cloned.steps = (cloned.steps || []).map((step, sIdx) => {
      if (step.widgets && step.widgets.length > 0) {
        step.widgets = step.widgets.map(w => ({
          ...w,
          layout: w.layout || { width: '100%', height: 'auto' }
        }));
        return step;
      }

      const widgets = [];

      // 1. Instruction Box
      widgets.push({
        id: `w-inst-${step.id || sIdx}`,
        type: 'INSTRUCTION_BOX',
        name: 'Step Instructions',
        layout: { width: '100%', height: 'auto' },
        props: {
          title: step.title || `Operation Step ${sIdx + 1}`,
          text: step.instruction || 'Follow standard operating procedure.',
          fontSize: 'text-base'
        }
      });

      // 2. Safety Warning (if present)
      if (step.safety_warnings && step.safety_warnings.length > 0) {
        widgets.push({
          id: `w-safe-${step.id || sIdx}`,
          type: 'CALLOUT_ALERT',
          name: 'Safety Warning',
          layout: { width: '100%', height: 'auto' },
          props: {
            level: 'WARNING',
            title: 'Critical Safety Precautions',
            text: step.safety_warnings.join(' • ')
          }
        });
      }

      // 3. Media Blueprint (if present)
      if (step.images && step.images.length > 0) {
        widgets.push({
          id: `w-media-${step.id || sIdx}`,
          type: 'MEDIA_VIEWER',
          name: 'Drawing Reference',
          props: {
            imageUrl: step.images[0],
            caption: `Blueprint & Drawing Reference (Page ${step.source_pages?.[0] || 1})`
          }
        });
      }

      // 4. Tools & Materials (if present)
      if ((step.tools && step.tools.length > 0) || (step.materials && step.materials.length > 0)) {
        widgets.push({
          id: `w-tools-${step.id || sIdx}`,
          type: 'TOOLS_MATERIALS',
          name: 'Tools & Materials',
          props: {
            tools: step.tools || [],
            materials: step.materials || []
          }
        });
      }

      // 5. Checkpoints
      (step.checkpoints || []).forEach((cp, cpIdx) => {
        if (cp.type === 'numeric') {
          widgets.push({
            id: cp.id || `w-cp-num-${cpIdx}`,
            type: 'NUMERIC_TOLERANCE',
            name: 'Numeric Measurement',
            props: {
              label: cp.label,
              unit: cp.unit || 'mm',
              nominal: cp.nominal ?? 0,
              min: cp.min ?? 0,
              max: cp.max ?? 10,
              required: cp.required ?? true
            }
          });
        } else if (cp.type === 'ok_ng') {
          widgets.push({
            id: cp.id || `w-cp-okng-${cpIdx}`,
            type: 'INSPECTION_OK_NG',
            name: 'Visual OK / NG',
            props: {
              label: cp.label,
              required: cp.required ?? true,
              requireReasonOnNg: true
            }
          });
        } else if (cp.type === 'scan_code') {
          widgets.push({
            id: cp.id || `w-cp-scan-${cpIdx}`,
            type: 'BARCODE_SCANNER',
            name: 'Barcode / QR Scanner',
            props: {
              label: cp.label,
              prefix: cp.expected_prefix || '',
              required: cp.required ?? true
            }
          });
        } else {
          widgets.push({
            id: cp.id || `w-cp-chk-${cpIdx}`,
            type: 'CHECKLIST_TASK',
            name: 'Task Checklist',
            props: {
              label: cp.label,
              required: cp.required ?? true
            }
          });
        }
      });

      step.widgets = widgets;
      return step;
    });

    return cloned;
  };

  /**
   * Syncs widgets back to step attributes for operator runtime compatibility
   */
  const syncWidgetsToStepData = (sourceWi) => {
    const cloned = JSON.parse(JSON.stringify(sourceWi));
    cloned.paper_size = sourceWi.paper_size || 'A4';
    cloned.paper_orientation = sourceWi.paper_orientation || 'landscape';
    cloned.steps.forEach((step) => {
      const widgets = step.widgets || [];
      const checkpoints = [];
      const safetyWarnings = [];
      const tools = [];
      const materials = [];
      const images = [];

      widgets.forEach((w) => {
        if (w.type === 'INSTRUCTION_BOX') {
          step.title = w.props.title || step.title;
          step.instruction = w.props.text || step.instruction;
        } else if (w.type === 'CALLOUT_ALERT') {
          if (w.props.text) safetyWarnings.push(w.props.text);
        } else if (w.type === 'TOOLS_MATERIALS') {
          if (Array.isArray(w.props.tools)) tools.push(...w.props.tools);
          if (Array.isArray(w.props.materials)) materials.push(...w.props.materials);
        } else if (w.type === 'MEDIA_VIEWER') {
          if (w.props.imageUrl) images.push(w.props.imageUrl);
        } else if (w.type === 'NUMERIC_TOLERANCE') {
          checkpoints.push({
            id: w.id,
            type: 'numeric',
            label: w.props.label,
            unit: w.props.unit,
            nominal: parseFloat(w.props.nominal) || 0,
            min: parseFloat(w.props.min) || 0,
            max: parseFloat(w.props.max) || 0,
            required: w.props.required ?? true
          });
        } else if (w.type === 'INSPECTION_OK_NG') {
          checkpoints.push({
            id: w.id,
            type: 'ok_ng',
            label: w.props.label,
            required: w.props.required ?? true
          });
        } else if (w.type === 'BARCODE_SCANNER') {
          checkpoints.push({
            id: w.id,
            type: 'scan_code',
            label: w.props.label,
            expected_prefix: w.props.prefix,
            required: w.props.required ?? true
          });
        } else if (w.type === 'CHECKLIST_TASK') {
          checkpoints.push({
            id: w.id,
            type: 'checklist',
            label: w.props.label,
            required: w.props.required ?? true
          });
        } else if (w.type === 'SIGNATURE_PAD') {
          checkpoints.push({
            id: w.id,
            type: 'checklist',
            label: `Sign-off: ${w.props.label}`,
            required: w.props.required ?? true
          });
        }
      });

      step.checkpoints = checkpoints;
      if (safetyWarnings.length > 0) step.safety_warnings = safetyWarnings;
      if (tools.length > 0) step.tools = tools;
      if (materials.length > 0) step.materials = materials;
      if (images.length > 0) step.images = images;
    });

    return cloned;
  };

  const isImmutable = wi?.status === 'Published';
  const currentStep = wi?.steps?.[activeStepIndex] || {};
  const currentWidgets = currentStep.widgets || [];
  const selectedWidget = currentWidgets.find(w => w.id === selectedWidgetId);

  // Paper & Canvas Configs
  const activePaperSize = wi?.paper_size || 'A4';
  const activeOrientation = wi?.paper_orientation || 'landscape';
  const currentPaperConfig = PAPER_CONFIGS[activePaperSize] || PAPER_CONFIGS.A4;
  const currentOrientConfig = currentPaperConfig[activeOrientation] || currentPaperConfig.landscape;

  const handleSetPaperSize = (size) => {
    setWi(prev => ({ ...prev, paper_size: size }));
    toast.success(`Ukuran kertas: ${size} (${PAPER_CONFIGS[size]?.dims || ''})`);
  };

  const handleSetOrientation = (orient) => {
    setWi(prev => ({ ...prev, paper_orientation: orient }));
    toast.success(`Orientasi kertas: ${orient === 'portrait' ? 'Portrait (Tegak)' : 'Landscape (Mendatar)'}`);
  };

  const handleTriggerPrint = (scope = 'all') => {
    setPrintScope(scope);
    setShowPrintModal(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const stepsToPrint = printScope === 'current'
    ? (currentStep ? [currentStep] : [])
    : (wi?.steps || []);

  // Widget Actions
  const handleAddWidget = (widgetPreset) => {
    if (isImmutable) return;
    const newWidget = {
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: widgetPreset.type,
      name: widgetPreset.name,
      layout: {
        width: '100%',
        height: 'auto'
      },
      props: JSON.parse(JSON.stringify(widgetPreset.defaultProps))
    };

    const updatedSteps = [...wi.steps];
    updatedSteps[activeStepIndex].widgets = [...(updatedSteps[activeStepIndex].widgets || []), newWidget];
    setWi({ ...wi, steps: updatedSteps });
    setSelectedWidgetId(newWidget.id);
    toast.success(`Widget "${widgetPreset.name}" ditambahkan ke canvas`);
  };

  const handleDeleteWidget = (wId) => {
    if (isImmutable) return;
    const updatedSteps = [...wi.steps];
    updatedSteps[activeStepIndex].widgets = updatedSteps[activeStepIndex].widgets.filter(w => w.id !== wId);
    setWi({ ...wi, steps: updatedSteps });
    if (selectedWidgetId === wId) setSelectedWidgetId(null);
  };

  const handleMoveWidget = (fromIndex, toIndex) => {
    if (isImmutable || toIndex < 0 || toIndex >= currentWidgets.length) return;
    const updated = [...currentWidgets];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    const updatedSteps = [...wi.steps];
    updatedSteps[activeStepIndex].widgets = updated;
    setWi({ ...wi, steps: updatedSteps });
  };

  const handleUpdateWidgetProps = (newProps) => {
    if (isImmutable || !selectedWidgetId) return;
    const updatedSteps = [...wi.steps];
    updatedSteps[activeStepIndex].widgets = updatedSteps[activeStepIndex].widgets.map(w => {
      if (w.id === selectedWidgetId) {
        return { ...w, props: { ...w.props, ...newProps } };
      }
      return w;
    });
    setWi({ ...wi, steps: updatedSteps });
  };

  const handleUpdateWidgetLayout = (wId, newLayout) => {
    if (isImmutable || !wId) return;
    const updatedSteps = [...wi.steps];
    updatedSteps[activeStepIndex].widgets = (updatedSteps[activeStepIndex].widgets || []).map(w => {
      if (w.id === wId) {
        return { ...w, layout: { ...(w.layout || {}), ...newLayout } };
      }
      return w;
    });
    setWi({ ...wi, steps: updatedSteps });
  };

  // PowerPoint-style Interactive Free Resize Handle
  const handleStartResize = (e, widget) => {
    e.stopPropagation();
    e.preventDefault();
    const sheetEl = document.getElementById('wi-paper-sheet');
    const sheetWidth = sheetEl ? sheetEl.getBoundingClientRect().width - 48 : 900;
    const targetEl = e.currentTarget.closest('[data-widget-id]');
    const rect = targetEl ? targetEl.getBoundingClientRect() : { width: 320, height: 160 };

    setResizing({
      id: widget.id,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
      sheetWidth
    });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;
      const newW = Math.max(220, Math.min(resizing.sheetWidth, resizing.startW + deltaX));
      const newH = Math.max(80, resizing.startH + deltaY);

      handleUpdateWidgetLayout(resizing.id, {
        width: `${Math.round(newW)}px`,
        height: `${Math.round(newH)}px`
      });
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  // Step Management
  const handleAddStep = () => {
    if (isImmutable) return;
    const newStepNum = (wi.steps?.length || 0) + 1;
    const newStep = {
      id: `step-${Date.now()}`,
      step_number: newStepNum,
      title: `Step ${newStepNum}: Assembly Operation`,
      instruction: 'Detail operation guidance for shopfloor operator.',
      source_pages: [1],
      cycle_time_target_sec: 60,
      widgets: [
        {
          id: `w-inst-${Date.now()}`,
          type: 'INSTRUCTION_BOX',
          name: 'Step Instructions',
          layout: { width: '100%', height: 'auto' },
          props: {
            title: `Step ${newStepNum}: Operation Title`,
            text: 'Perform guided operation per manufacturing engineering spec.',
            fontSize: 'text-base'
          }
        },
        {
          id: `w-chk-${Date.now()}`,
          type: 'CHECKLIST_TASK',
          name: 'Task Checklist',
          layout: { width: '100%', height: 'auto' },
          props: {
            label: 'Operation completed per engineering standard',
            required: true
          }
        }
      ]
    };
    const updated = [...wi.steps, newStep];
    reindexSteps(updated);
    setActiveStepIndex(updated.length - 1);
    setSelectedWidgetId(newStep.widgets[0].id);
  };

  // Add Blank Screen (PowerPoint slide style)
  const handleAddBlankScreen = () => {
    if (isImmutable) return;
    const newStepNum = (wi.steps?.length || 0) + 1;
    const newStep = {
      id: `step-blank-${Date.now()}`,
      step_number: newStepNum,
      title: `Screen ${newStepNum}: Blank Canvas`,
      instruction: '',
      source_pages: [1],
      cycle_time_target_sec: 60,
      widgets: []
    };
    const updated = [...wi.steps, newStep];
    reindexSteps(updated);
    setActiveStepIndex(updated.length - 1);
    setSelectedWidgetId(null);
    toast.success(`Blank Screen ${newStepNum} (Layar Kosong) berhasil ditambahkan!`);
  };

  const handleDuplicateStep = (index) => {
    if (isImmutable) return;
    const source = wi.steps[index];
    const clone = JSON.parse(JSON.stringify(source));
    clone.id = `step-${Date.now()}`;
    clone.title = `${source.title} (Copy)`;
    const updated = [...wi.steps];
    updated.splice(index + 1, 0, clone);
    reindexSteps(updated);
    setActiveStepIndex(index + 1);
  };

  const handleDeleteStep = (index) => {
    if (isImmutable) return;
    if (wi.steps.length <= 1) {
      toast.error('Instruksi kerja harus memiliki minimal 1 langkah');
      return;
    }
    const updated = wi.steps.filter((_, i) => i !== index);
    reindexSteps(updated);
    setActiveStepIndex(Math.max(0, index - 1));
  };

  const reindexSteps = (stepList) => {
    stepList.forEach((s, idx) => {
      s.step_number = idx + 1;
    });
    setWi({ ...wi, steps: stepList });
  };

  // Save as Draft
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const synced = syncWidgetsToStepData(wi);
      await digitalWiDB.saveWorkInstruction(synced);
      setWi(synced);
      toast.success('Work Instruction Studio berhasil disimpan!');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan WI: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit for Approval
  const handleSubmitApproval = async () => {
    try {
      await handleSave();
      await digitalWiDB.submitForApproval(wi.id, 'Manufacturing Engineer');
      toast.success('Diajukan ke Approval Center untuk validasi ISO 9001!');
      navigate('/digital-wi/approvals');
    } catch (e) {
      toast.error('Gagal mengajukan approval: ' + e.message);
    }
  };

  // ECO - Create New Revision
  const handleCreateNewRevision = async () => {
    try {
      const updated = await digitalWiDB.createNewRevision(wi.id, 'Manufacturing Engineer');
      toast.success(`Engineering Change Order (ECO) dibuat! Versi baru: ${updated.current_revision}`);
      setWi(hydrateWiWithWidgets(updated));
    } catch (e) {
      toast.error('Gagal membuat revisi baru');
    }
  };

  if (loading || !wi) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#714B67]">Loading WI Studio Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── CSS PRINT ISOLATION RULES ──────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Force hide screen editor, navigation bar, and all widgets */
          #wi-screen-editor,
          nav,
          header:not(.wi-print-header),
          aside,
          .no-print,
          #zoom-widget,
          button,
          div[role="status"],
          div[aria-live="polite"],
          div[aria-live="assertive"],
          [data-sonner-toaster],
          .lucide-trash-2,
          .lucide-arrow-up,
          .lucide-arrow-down {
            display: none !important;
          }

          /* Reset viewport & background for paper printing */
          html, body, #root, #root > div {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            display: block !important;
            position: static !important;
          }

          /* Display ONLY the pure Work Instruction document */
          #wi-print-document {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .wi-print-page {
            display: block !important;
            break-after: page !important;
            page-break-after: always !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 10mm !important;
            margin: 0 0 15mm 0 !important;
            border: 1.5px solid #000000 !important;
            border-radius: 6px !important;
          }

          .wi-print-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
            margin-bottom: 0 !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: ${activePaperSize === '16:9' ? 'A4 landscape' : `${activePaperSize.toLowerCase()} ${activeOrientation}`};
            margin: 8mm;
          }
        }
      `}} />

      {/* ── PRINT SELECTION MODAL ──────────────────────────────────── */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4 no-print animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 max-w-md w-full overflow-hidden">
            <div className="bg-[#714B67] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer size={16} />
                <h3 className="font-bold text-sm">Print Work Instruction</h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-gray-700">
              <div>
                <label className="block font-bold text-gray-900 mb-2">Pilih Cakupan Halaman Cetak:</label>
                <div className="space-y-2">
                  <label
                    onClick={() => setPrintScope('all')}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      printScope === 'all'
                        ? 'border-[#714B67] bg-[#fbf5f9] ring-1 ring-[#714B67]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="printScope"
                      checked={printScope === 'all'}
                      onChange={() => setPrintScope('all')}
                      className="mt-0.5 accent-[#714B67]"
                    />
                    <div>
                      <div className="font-bold text-gray-900">Cetak Seluruh Langkah (Lengkap)</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Mencetak semua langkah (Step 1 s/d {wi.steps?.length || 1}) sebagai dokumen standar SOP terpadu.
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setPrintScope('current')}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      printScope === 'current'
                        ? 'border-[#714B67] bg-[#fbf5f9] ring-1 ring-[#714B67]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="printScope"
                      checked={printScope === 'current'}
                      onChange={() => setPrintScope('current')}
                      className="mt-0.5 accent-[#714B67]"
                    />
                    <div>
                      <div className="font-bold text-gray-900">
                        Cetak Langkah Aktif Saja (Step {activeStepIndex + 1})
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Hanya mencetak lembar kerja untuk: &ldquo;{currentStep.title}&rdquo;.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Print Specs Summary Box */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-[11px] space-y-1 font-mono text-gray-600">
                <div className="flex justify-between">
                  <span>Dokumen:</span>
                  <span className="font-bold text-gray-900">{wi.doc_number} ({wi.current_revision})</span>
                </div>
                <div className="flex justify-between">
                  <span>Ukuran Kertas:</span>
                  <span className="font-bold text-[#714B67]">{currentPaperConfig.name} ({currentPaperConfig.dims})</span>
                </div>
                <div className="flex justify-between">
                  <span>Orientasi:</span>
                  <span className="font-bold text-[#00A09D] uppercase">{activeOrientation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Lembar:</span>
                  <span className="font-bold text-gray-900">{printScope === 'all' ? wi.steps?.length || 1 : 1} Halaman</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded text-[11px] flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                <span>UI editor, navbar, dan panel samping otomatis disembunyikan saat mencetak.</span>
              </div>
            </div>

            <div className="bg-gray-100 px-5 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                data-testid="confirm-print-dialog-btn"
                onClick={() => handleTriggerPrint(printScope)}
                className="px-4 py-1.5 bg-[#714B67] hover:bg-[#56384e] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} />
                Buka Dialog Print (Cetak)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREEN EDITOR (Disembunyikan saat @media print) ───────────── */}
      <div id="wi-screen-editor" className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans select-none no-print">
        {/* ── TOP HEADER: ODOO STUDIO THEME ───────────────────────────── */}
        <header className="bg-[#714B67] text-white px-5 py-2.5 flex items-center justify-between shadow-md z-40 border-b border-[#56384e]">
        <div className="flex items-center gap-3">
          <Link
            to="/digital-wi/library"
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/90"
            title="Back to WI Library"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase flex items-center gap-1">
              <Sparkles size={12} className="text-amber-300" />
              WI STUDIO
            </span>
            <span className="text-white/40">/</span>
            <input
              type="text"
              data-testid="wi-doc-number"
              disabled={isImmutable}
              value={wi.doc_number || ''}
              onChange={(e) => setWi({ ...wi, doc_number: e.target.value })}
              className="bg-black/20 hover:bg-black/30 px-2 py-1 rounded text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/40 w-32"
            />
            <span className="text-white/40">/</span>
            <input
              type="text"
              disabled={isImmutable}
              value={wi.title || ''}
              onChange={(e) => setWi({ ...wi, title: e.target.value })}
              className="bg-transparent hover:bg-black/20 px-2 py-1 rounded text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/40 w-72 truncate"
              placeholder="Work Instruction Title..."
            />
          </div>
        </div>

        {/* Center: Odoo Pipeline Status Pills */}
        <div className="hidden lg:flex items-center bg-black/25 rounded-full p-1 text-[11px] font-bold border border-white/10">
          {['Draft', 'Pending Approval', 'Approved', 'Published'].map((st, i) => {
            const isActive = wi.status === st;
            return (
              <span
                key={st}
                className={`px-3 py-0.5 rounded-full transition-all ${
                  isActive
                    ? 'bg-white text-[#714B67] shadow-xs'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {st}
              </span>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isImmutable ? (
            <button
              onClick={handleCreateNewRevision}
              className="px-3 py-1.5 bg-[#00A09D] hover:bg-[#008f8c] text-white text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy size={13} />
              Create ECO ({wi.current_revision})
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3.5 py-1.5 bg-white text-[#714B67] hover:bg-gray-100 text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={handleSubmitApproval}
                disabled={isSaving}
                className="px-3.5 py-1.5 bg-[#00A09D] hover:bg-[#008f8c] text-white text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck size={14} />
                Submit Sign-off
              </button>
            </>
          )}

          <button
            onClick={() => navigate(`/digital-wi/operator/${wi.id}`)}
            className="px-3 py-1.5 bg-black/30 hover:bg-black/50 text-white text-xs font-semibold rounded-md border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlayCircle size={14} />
            Preview Runtime
          </button>
        </div>
      </header>

      {/* ── SUBHEADER: Odoo Control Panel & Paper Setup ────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex flex-wrap items-center justify-between text-xs text-gray-600 shadow-2xs gap-3">
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-gray-400">PART:</span>
            <input
              type="text"
              disabled={isImmutable}
              value={wi.part_number || ''}
              onChange={(e) => setWi({ ...wi, part_number: e.target.value })}
              className="px-1.5 py-0.5 border border-gray-300 rounded font-bold text-gray-800 w-28 text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-gray-400">REV:</span>
            <span className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-bold text-[#714B67]">
              {wi.current_revision}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">DEPT:</span>
            <input
              type="text"
              disabled={isImmutable}
              value={wi.department || ''}
              onChange={(e) => setWi({ ...wi, department: e.target.value })}
              className="px-1.5 py-0.5 border border-gray-300 rounded text-gray-700 w-32 text-xs"
            />
          </div>

          <div className="hidden sm:block h-4 w-px bg-gray-300" />

          {/* Paper Size Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-semibold flex items-center gap-1">
              <FileText size={13} className="text-[#714B67]" />
              PAPER:
            </span>
            <select
              data-testid="paper-size-select"
              value={activePaperSize}
              onChange={(e) => handleSetPaperSize(e.target.value)}
              className="px-2 py-0.5 border border-gray-300 rounded bg-white text-gray-800 font-bold focus:outline-none focus:border-[#714B67] cursor-pointer text-xs shadow-2xs"
            >
              <option value="A4">A4 (210×297 mm)</option>
              <option value="A3">A3 (297×420 mm)</option>
              <option value="Letter">Letter (8.5×11 in)</option>
              <option value="16:9">16:9 Screen (Kiosk)</option>
            </select>
          </div>

          {/* Orientation Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-semibold">ORIENT:</span>
            <div className="flex items-center bg-gray-100 p-0.5 rounded border border-gray-300">
              <button
                type="button"
                data-testid="orientation-portrait-btn"
                onClick={() => handleSetOrientation('portrait')}
                className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  activeOrientation === 'portrait'
                    ? 'bg-[#714B67] text-white shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Portrait (Tegak)"
              >
                <div className="w-2.5 h-3.5 border border-current rounded-2xs" />
                Portrait
              </button>
              <button
                type="button"
                data-testid="orientation-landscape-btn"
                onClick={() => handleSetOrientation('landscape')}
                className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  activeOrientation === 'landscape'
                    ? 'bg-[#714B67] text-white shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Landscape (Mendatar)"
              >
                <div className="w-3.5 h-2.5 border border-current rounded-2xs" />
                Landscape
              </button>
            </div>
          </div>
        </div>

        {/* Right subheader items: Guides & Print */}
        <div className="flex items-center gap-2">
          {isImmutable && (
            <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded text-[11px] font-bold mr-1">
              <AlertTriangle size={13} />
              Dokumen Published Terkunci
            </div>
          )}

          <button
            type="button"
            onClick={() => setCanvasSettings(prev => ({ ...prev, showMargins: !prev.showMargins }))}
            className={`px-2 py-0.5 rounded border text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              canvasSettings.showMargins
                ? 'bg-sky-50 border-sky-300 text-sky-700 font-bold'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            }`}
            title="Tampilkan Panduan Batas Margin Kertas (10mm)"
          >
            Margin 10mm
          </button>

          <button
            type="button"
            onClick={() => setCanvasSettings(prev => ({ ...prev, showGrid: !prev.showGrid }))}
            className={`px-2 py-0.5 rounded border text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              canvasSettings.showGrid
                ? 'bg-purple-50 border-purple-300 text-[#714B67] font-bold'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            }`}
            title="Tampilkan Engineering Dot Grid"
          >
            <Grid size={12} />
            Grid
          </button>

          <button
            type="button"
            data-testid="print-wi-btn"
            onClick={() => setShowPrintModal(true)}
            className="px-2.5 py-0.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Cetak Dokumen Instruksi Kerja / Export PDF"
          >
            <Printer size={12} />
            Print
          </button>
        </div>
      </div>

      {/* ── 3-COLUMN STUDIO LAYOUT ──────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT SIDEBAR: STEPS & WIDGETS PALETTE (Slim fixed 240px) ── */}
        <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col justify-between overflow-hidden shadow-2xs">
          {/* Odoo Tab Selector */}
          <div className="flex border-b border-gray-200 bg-[#f8f9fa]">
            <button
              onClick={() => setLeftTab('steps')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                leftTab === 'steps'
                  ? 'bg-white text-[#714B67] border-b-2 border-[#714B67] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Layers size={14} />
              Steps ({wi.steps?.length || 0})
            </button>
            <button
              onClick={() => setLeftTab('widgets')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                leftTab === 'widgets'
                  ? 'bg-white text-[#00A09D] border-b-2 border-[#00A09D] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Plus size={14} />
              Add Widgets
            </button>
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {leftTab === 'steps' ? (
              /* Steps Outline */
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Routing Sequence
                  </span>
                  {!isImmutable && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleAddBlankScreen}
                        data-testid="add-blank-screen-btn"
                        className="px-1.5 py-0.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-300 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Tambah Blank Screen / Slide Kosong Baru (PowerPoint Style)"
                      >
                        <Plus size={10} /> Blank
                      </button>
                      <button
                        onClick={handleAddStep}
                        data-testid="add-step-btn"
                        className="px-2 py-0.5 bg-[#714B67] hover:bg-[#56384e] text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Tambah Standard Step dengan Template"
                      >
                        <Plus size={10} /> Step
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  {wi.steps?.map((step, idx) => {
                    const isSelected = activeStepIndex === idx;
                    return (
                      <div
                        key={step.id || idx}
                        onClick={() => {
                          setActiveStepIndex(idx);
                          setSelectedWidgetId(null);
                        }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#714B67]/10 border-[#714B67] text-gray-900 shadow-2xs border-l-4'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-[#714B67]">
                            Step {step.step_number}
                          </span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                            {step.widgets?.length || 0} widgets
                          </span>
                        </div>
                        <div className="font-semibold text-gray-900 mt-1 truncate">
                          {step.title}
                        </div>

                        {/* Reorder & Action tools */}
                        {!isImmutable && (
                          <div className="mt-2 pt-1 border-t border-gray-100 flex items-center justify-between text-gray-400">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); if (idx > 0) { const updated = [...wi.steps]; const item = updated.splice(idx, 1)[0]; updated.splice(idx - 1, 0, item); reindexSteps(updated); setActiveStepIndex(idx - 1); } }}
                                disabled={idx === 0}
                                className="p-0.5 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                                title="Move Step Up"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); if (idx < wi.steps.length - 1) { const updated = [...wi.steps]; const item = updated.splice(idx, 1)[0]; updated.splice(idx + 1, 0, item); reindexSteps(updated); setActiveStepIndex(idx + 1); } }}
                                disabled={idx === wi.steps.length - 1}
                                className="p-0.5 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                                title="Move Step Down"
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDuplicateStep(idx); }}
                                className="p-0.5 hover:text-blue-600 cursor-pointer"
                                title="Duplicate Step"
                              >
                                <Copy size={12} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteStep(idx); }}
                                className="p-0.5 hover:text-rose-600 cursor-pointer"
                                title="Delete Step"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Widgets Palette */
              <div className="space-y-4">
                <p className="text-[11px] text-gray-500 leading-snug">
                  Click any widget to insert directly into the active step canvas:
                </p>

                {WIDGET_CATALOG.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-1">
                      {cat.category}
                    </span>
                    <div className="space-y-1.5">
                      {cat.items.map((wPreset, wIdx) => {
                        const Icon = wPreset.icon;
                        return (
                          <button
                            key={wIdx}
                            disabled={isImmutable}
                            onClick={() => handleAddWidget(wPreset)}
                            className="w-full flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 bg-white hover:border-[#00A09D] hover:bg-[#e6f7f7]/30 text-left transition-all group disabled:opacity-50 cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded bg-[#714B67]/10 text-[#714B67] group-hover:bg-[#00A09D] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                              <Icon size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-gray-900 group-hover:text-[#00A09D] transition-colors truncate">
                                {wPreset.name}
                              </div>
                              <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                {wPreset.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Left Footer Info */}
          <div className="p-3 border-t border-gray-200 bg-[#f8f9fa] text-[11px] text-gray-500 flex items-center justify-between font-mono">
            <span>Cycle Target:</span>
            <div className="flex items-center gap-1 font-bold text-gray-800">
              <input
                type="number"
                disabled={isImmutable}
                value={currentStep.cycle_time_target_sec || 60}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 60;
                  const updated = [...wi.steps];
                  updated[activeStepIndex].cycle_time_target_sec = val;
                  setWi({ ...wi, steps: updated });
                }}
                className="w-12 px-1 border border-gray-300 rounded text-center bg-white"
              />
              sec
            </div>
          </div>
        </aside>

        {/* ── CENTER: INTERACTIVE WI CANVAS (Expansive Flex-1) ──────── */}
        <main className="flex-1 min-w-0 bg-[#eef1f5] p-4 lg:p-6 overflow-y-auto flex flex-col items-center">
          {/* Canvas Toolbar & Format Indicator */}
          <div className={`${currentOrientConfig.widthClass} mb-3 flex items-center justify-between text-xs text-gray-600 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-lg border border-gray-300 shadow-2xs`}>
            <div className="flex items-center gap-2">
              <span className="bg-[#714B67]/10 text-[#714B67] px-2 py-0.5 rounded font-mono font-bold text-[11px] flex items-center gap-1">
                <FileText size={12} />
                {currentPaperConfig.id} {activeOrientation === 'portrait' ? 'PORTRAIT' : 'LANDSCAPE'}
              </span>
              <span className="text-gray-400 font-mono text-[11px]">({currentPaperConfig.dims})</span>
              <button
                type="button"
                onClick={() => handleSetOrientation(activeOrientation === 'portrait' ? 'landscape' : 'portrait')}
                className="text-xs text-[#00A09D] hover:underline font-semibold flex items-center gap-1 cursor-pointer ml-1"
                title="Ganti orientasi canvas"
              >
                <RefreshCw size={11} />
                Switch to {activeOrientation === 'portrait' ? 'Landscape' : 'Portrait'}
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <div className="flex items-center bg-gray-100 rounded border border-gray-300 px-1 py-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCanvasSettings(s => ({ ...s, zoom: Math.max(50, s.zoom - 10) }))}
                  className="px-1.5 hover:text-black font-bold cursor-pointer"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="px-1 font-bold text-gray-700">{canvasSettings.zoom}%</span>
                <button
                  type="button"
                  onClick={() => setCanvasSettings(s => ({ ...s, zoom: Math.min(150, s.zoom + 10) }))}
                  className="px-1.5 hover:text-black font-bold cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedWidgetId(null)}
                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 text-[11px] font-sans font-semibold flex items-center gap-1 cursor-pointer"
                title="Buka Pengaturan Kertas di Panel Kanan"
              >
                <Settings2 size={12} />
                Page Setup
              </button>
            </div>
          </div>

          {/* Canvas Wrapper - Form sheet preview matching paper dimensions */}
          <div
            id="wi-paper-sheet"
            className={`${currentOrientConfig.widthClass} transition-all duration-300 relative bg-white border border-gray-300 rounded-xl shadow-lg p-6 space-y-5`}
            style={{
              minHeight: currentOrientConfig.minHeight,
              transform: `scale(${canvasSettings.zoom / 100})`,
              transformOrigin: 'top center',
              ...(canvasSettings.showGrid ? {
                backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              } : {})
            }}
          >
            {/* 10mm Printable Margin Guide */}
            {canvasSettings.showMargins && (
              <div className="absolute inset-3 border border-dashed border-sky-400/50 rounded-lg pointer-events-none flex items-start justify-end p-1.5 z-10">
                <span className="text-[9px] font-mono font-bold text-sky-600/80 uppercase tracking-widest bg-white/90 px-1 rounded shadow-2xs">
                  10mm Printable Margin
                </span>
              </div>
            )}

            {/* ISO 7200 Standard Engineering Title Block */}
            {canvasSettings.titleBlockStyle === 'iso_header' && (
              <div className="border border-gray-300 rounded-lg bg-[#fafafa] p-3 text-xs font-mono grid grid-cols-12 gap-2 text-gray-700 shadow-2xs relative z-20">
                <div className="col-span-12 sm:col-span-5 border-b sm:border-b-0 sm:border-r border-gray-200 pr-2">
                  <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">ORGANIZATION / SYSTEM</div>
                  <div className="font-bold text-[#714B67] text-xs flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    MAVI MES — DIGITAL WI
                  </div>
                  <div className="text-[11px] text-gray-600 truncate mt-0.5 font-sans font-semibold">{wi.title}</div>
                </div>
                <div className="col-span-6 sm:col-span-3 border-r border-gray-200 pr-2">
                  <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">DOC NO & REV</div>
                  <div className="font-bold text-gray-900 text-xs">{wi.doc_number}</div>
                  <div className="text-[10px] text-gray-500">{wi.current_revision} • {wi.status}</div>
                </div>
                <div className="col-span-6 sm:col-span-2 border-r border-gray-200 pr-2">
                  <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">PART & DEPT</div>
                  <div className="font-bold text-gray-900 text-[11px] truncate">{wi.part_number}</div>
                  <div className="text-[10px] text-gray-500 truncate">{wi.department}</div>
                </div>
                <div className="col-span-12 sm:col-span-2 text-right">
                  <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">FORMAT & SHEET</div>
                  <div className="font-bold text-[#00A09D] text-xs">{currentPaperConfig.id} {activeOrientation === 'portrait' ? 'PORT' : 'LAND'}</div>
                  <div className="text-[10px] text-gray-500 font-bold">Sheet {activeStepIndex + 1} of {wi.steps?.length || 1}</div>
                </div>
              </div>
            )}

            {/* Step Banner */}
            {canvasSettings.titleBlockStyle !== 'none' && (
              <div className="border-b border-gray-200 pb-3 flex items-start justify-between relative z-20">
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-[#714B67] bg-[#714B67]/10 px-2 py-0.5 rounded">
                    STEP {activeStepIndex + 1} OF {wi.steps?.length || 1}
                  </span>
                  <input
                    type="text"
                    disabled={isImmutable}
                    value={currentStep.title || ''}
                    onChange={(e) => {
                      const updated = [...wi.steps];
                      updated[activeStepIndex].title = e.target.value;
                      setWi({ ...wi, steps: updated });
                    }}
                    className="text-lg font-bold text-gray-900 mt-1.5 w-full bg-transparent hover:bg-gray-50 px-1 py-0.5 rounded border border-transparent hover:border-gray-300 focus:bg-white focus:border-[#714B67] focus:outline-none"
                    placeholder="Enter Step Title..."
                  />
                </div>

                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                  Target: {currentStep.cycle_time_target_sec || 60}s
                </span>
              </div>
            )}

            {/* Widgets Canvas List (PowerPoint Style Free-Size & Multi-Column) */}
            <div className="flex flex-wrap gap-4 items-start content-start min-h-[360px] relative w-full">
              {currentWidgets.length === 0 ? (
                /* Blank Screen Slide State */
                <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center space-y-4 bg-gradient-to-b from-gray-50/80 to-white shadow-2xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center mx-auto shadow-2xs">
                    <Monitor size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-wider text-[#714B67] bg-[#714B67]/10 px-2.5 py-0.5 rounded uppercase">
                      Blank Screen Canvas • Slide {activeStepIndex + 1}
                    </span>
                    <h4 className="text-base font-bold text-gray-800 mt-2">Canvas Layar Kosong (PowerPoint Style)</h4>
                    <p className="text-xs text-gray-500 max-w-lg mx-auto mt-1">
                      Desain layar secara bebas! Atur ukuran widget (Free-size: 1/4, 1/3, 1/2, atau drag bebas) dan tempatkan berdampingan seperti slide presentasi.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleAddWidget(WIDGET_CATALOG[0].items[0])}
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Type size={13} className="text-[#714B67]" /> + Text Instructions
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddWidget(WIDGET_CATALOG[4].items[0])}
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Image size={13} className="text-[#00A09D]" /> + Drawing Reference
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddWidget(WIDGET_CATALOG[2].items[0])}
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <CheckSquare size={13} className="text-emerald-600" /> + Checklist
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddWidget(WIDGET_CATALOG[1].items[0])}
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Hash size={13} className="text-blue-600" /> + Measurement
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddWidget(WIDGET_CATALOG[0].items[1])}
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <ShieldAlert size={13} className="text-amber-500" /> + Safety Warning
                    </button>
                  </div>
                </div>
              ) : (
                currentWidgets.map((widget, wIdx) => {
                  const isSelected = selectedWidgetId === widget.id;
                  const wLayout = widget.layout || {};
                  const widthStyle = getWidgetWidthStyle(wLayout);
                  const heightStyle = wLayout.height && wLayout.height !== 'auto' ? wLayout.height : undefined;

                  return (
                    <div
                      key={widget.id}
                      data-widget-id={widget.id}
                      onClick={() => setSelectedWidgetId(widget.id)}
                      className={`relative rounded-xl border p-3.5 transition-all cursor-pointer group/widget ${
                        isSelected
                          ? 'border-[#714B67] bg-white ring-2 ring-[#714B67]/25 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                      }`}
                      style={{
                        width: widthStyle,
                        minHeight: heightStyle,
                        height: heightStyle,
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Top Widget Type Tag, PowerPoint Width Presets, & Actions */}
                      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-gray-100 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <Layers size={11} className="text-[#714B67]" />
                            {widget.name}
                          </span>

                          {/* Quick Width Buttons (PowerPoint presets) */}
                          <div className="hidden sm:flex items-center bg-gray-100 p-0.5 rounded border border-gray-200">
                            {[
                              { label: '1/4', val: '25%' },
                              { label: '1/3', val: '33.33%' },
                              { label: '1/2', val: '50%' },
                              { label: '2/3', val: '66.66%' },
                              { label: 'Full', val: '100%' }
                            ].map((preset) => {
                              const isWActive = (wLayout.width || '100%') === preset.val;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateWidgetLayout(widget.id, { width: preset.val });
                                  }}
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold transition-all cursor-pointer ${
                                    isWActive
                                      ? 'bg-[#714B67] text-white shadow-2xs'
                                      : 'text-gray-500 hover:text-black hover:bg-gray-200'
                                  }`}
                                  title={`Set lebar widget ${preset.label}`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {!isImmutable && (
                          <div className="flex items-center gap-1 opacity-70 group-hover/widget:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleMoveWidget(wIdx, wIdx - 1); }}
                              disabled={wIdx === 0}
                              className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                              title="Pindah Urutan ke Depan"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleMoveWidget(wIdx, wIdx + 1); }}
                              disabled={wIdx === currentWidgets.length - 1}
                              className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                              title="Pindah Urutan ke Belakang"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteWidget(widget.id); }}
                              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="Hapus Widget"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ── Widget Render Preview ───────────────────────── */}
                      {widget.type === 'INSTRUCTION_BOX' && (
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-gray-900">{widget.props.title}</h4>
                          <p className="text-xs text-gray-700 leading-relaxed bg-[#f8f9fa] p-3 rounded-lg border border-gray-100">
                            {widget.props.text}
                          </p>
                        </div>
                      )}

                      {widget.type === 'CALLOUT_ALERT' && (
                        <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                          widget.props.level === 'DANGER'
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : widget.props.level === 'INFO'
                              ? 'bg-blue-50 border-blue-200 text-blue-900'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}>
                          <div className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
                            <ShieldAlert size={15} />
                            {widget.props.title || 'Safety Warning'}
                          </div>
                          <p className="leading-snug text-xs">{widget.props.text}</p>
                        </div>
                      )}

                      {widget.type === 'TOOLS_MATERIALS' && (
                        <div className="space-y-2 text-xs">
                          {widget.props.tools?.length > 0 && (
                            <div>
                              <span className="font-bold text-gray-600 flex items-center gap-1 text-[11px] mb-1">
                                <Wrench size={12} /> Tools:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {widget.props.tools.map((t, idx) => (
                                  <span key={idx} className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[11px] text-gray-800">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {widget.props.materials?.length > 0 && (
                            <div>
                              <span className="font-bold text-gray-600 flex items-center gap-1 text-[11px] mb-1">
                                <Layers size={12} /> Materials:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {widget.props.materials.map((m, idx) => (
                                  <span key={idx} className="bg-[#e6f7f7] border border-teal-200 px-2 py-0.5 rounded text-[11px] text-teal-900">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {widget.type === 'NUMERIC_TOLERANCE' && (
                        <div className="bg-[#f8f9fa] border border-gray-200 p-3 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-900">{widget.props.label}</span>
                            {widget.props.required && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                MANDATORY
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-gray-600 bg-white p-2 rounded border border-gray-200">
                            <span>Spec: <strong className="text-gray-900">{widget.props.nominal} {widget.props.unit}</strong></span>
                            <span>Allowed: [{widget.props.min} - {widget.props.max} {widget.props.unit}]</span>
                          </div>
                        </div>
                      )}

                      {widget.type === 'INSPECTION_OK_NG' && (
                        <div className="bg-[#f8f9fa] border border-gray-200 p-3 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-900">{widget.props.label}</span>
                            {widget.props.required && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                MANDATORY
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-center">
                            <div className="py-2 bg-emerald-100 text-emerald-800 rounded border border-emerald-300 flex items-center justify-center gap-1">
                              <Check size={14} /> OK (PASS)
                            </div>
                            <div className="py-2 bg-rose-100 text-rose-800 rounded border border-rose-300 flex items-center justify-center gap-1">
                              <X size={14} /> NG (DEFECT)
                            </div>
                          </div>
                        </div>
                      )}

                      {widget.type === 'CHECKLIST_TASK' && (
                        <div className="flex items-center justify-between bg-[#f8f9fa] p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center">
                              <Check size={13} className="text-gray-400" />
                            </div>
                            <span className="font-semibold text-xs text-gray-900">{widget.props.label}</span>
                          </div>
                          {widget.props.required && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                              MANDATORY
                            </span>
                          )}
                        </div>
                      )}

                      {widget.type === 'BARCODE_SCANNER' && (
                        <div className="bg-[#f8f9fa] p-3 rounded-lg border border-gray-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-900 flex items-center gap-1">
                              <Scan size={13} /> {widget.props.label}
                            </span>
                            {widget.props.required && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                MANDATORY
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-300 rounded text-xs font-mono text-gray-500">
                            <span>Scan Input (Prefix: {widget.props.prefix || 'None'})</span>
                          </div>
                        </div>
                      )}

                      {widget.type === 'MEDIA_VIEWER' && (
                        <div className="space-y-1.5">
                          <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                            {widget.props.imageUrl ? (
                              <img src={widget.props.imageUrl} alt="CAD Drawing" className="h-full object-contain" />
                            ) : (
                              <div className="text-gray-400 text-xs">No image URL configured</div>
                            )}
                          </div>
                          {widget.props.caption && (
                            <p className="text-[11px] text-gray-500 italic text-center">{widget.props.caption}</p>
                          )}
                        </div>
                      )}

                      {widget.type === 'SIGNATURE_PAD' && (
                        <div className="bg-[#f8f9fa] border border-gray-200 p-3 rounded-lg space-y-1.5">
                          <span className="font-bold text-xs text-gray-900 flex items-center gap-1">
                            <PenTool size={13} /> {widget.props.label}
                          </span>
                          <div className="h-14 border border-dashed border-gray-300 bg-white rounded flex items-center justify-center text-[11px] text-gray-400 font-mono">
                            Touch sign-off zone
                          </div>
                        </div>
                      )}

                      {/* Interactive Drag-to-Resize Handle in bottom-right corner (PowerPoint style) */}
                      {!isImmutable && (
                        <div
                          onMouseDown={(e) => handleStartResize(e, widget)}
                          className="absolute bottom-0.5 right-0.5 w-4 h-4 cursor-se-resize flex items-end justify-end text-gray-300 hover:text-[#714B67] p-0.5 select-none transition-colors"
                          title="Tarik untuk Free Resize ukuran widget (PowerPoint style)"
                        >
                          <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-current rounded-br-2xs" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Canvas Bottom Action */}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>{currentWidgets.length} Active Widgets on Step</span>
              <button
                onClick={() => setLeftTab('widgets')}
                className="text-[#714B67] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Tambah Widget Baru
              </button>
            </div>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR: PROPERTIES INSPECTOR (Slim fixed 288px) ── */}
        <aside className="w-72 shrink-0 bg-white border-l border-gray-200 flex flex-col justify-between overflow-y-auto shadow-2xs">
          {selectedWidget ? (
            <div className="p-3 space-y-3">
              <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-[#714B67] bg-[#714B67]/10 px-1.5 py-0.5 rounded">
                    PROPERTIES
                  </span>
                  <h3 className="text-xs font-bold text-gray-900 mt-0.5 truncate">{selectedWidget.name}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedWidgetId(null)}
                    className="text-[10px] text-[#714B67] hover:underline font-semibold cursor-pointer"
                  >
                    ← Page Setup
                  </button>
                  <button
                    onClick={() => setSelectedWidgetId(null)}
                    className="text-gray-400 hover:text-gray-700 text-sm font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Widget Size & Layout (PowerPoint Free Size) */}
              <div className="bg-[#fbf5f9] border border-[#714B67]/20 rounded-lg p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#714B67] uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Maximize2 size={11} /> Size & Layout (Free Size)
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {selectedWidget.layout?.width || '100%'}
                  </span>
                </div>

                {/* Width Presets */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                    Lebar Kolom (Presets)
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { label: '1/4', val: '25%' },
                      { label: '1/3', val: '33.33%' },
                      { label: '1/2', val: '50%' },
                      { label: '2/3', val: '66.66%' },
                      { label: 'Full', val: '100%' }
                    ].map((p) => {
                      const isSel = (selectedWidget.layout?.width || '100%') === p.val;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleUpdateWidgetLayout(selectedWidget.id, { width: p.val })}
                          className={`py-1 text-[10px] font-bold rounded border transition-all cursor-pointer text-center ${
                            isSel
                              ? 'bg-[#714B67] text-white border-[#714B67] shadow-2xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Width & Height Inputs */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-0.5">Width Custom</label>
                    <input
                      type="text"
                      disabled={isImmutable}
                      value={selectedWidget.layout?.width || '100%'}
                      onChange={(e) => handleUpdateWidgetLayout(selectedWidget.id, { width: e.target.value })}
                      placeholder="e.g. 100%, 450px"
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-0.5">Height Custom</label>
                    <input
                      type="text"
                      disabled={isImmutable}
                      value={selectedWidget.layout?.height || 'auto'}
                      onChange={(e) => handleUpdateWidgetLayout(selectedWidget.id, { height: e.target.value })}
                      placeholder="e.g. auto, 260px"
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono text-[11px]"
                    />
                  </div>
                </div>
                <div className="text-[9px] text-gray-500 italic">
                  💡 Tips: Tarik handle pojok kanan bawah widget di canvas untuk free-resize langsung.
                </div>
              </div>

              {/* Dynamic Property Form based on widget type */}
              <div className="space-y-2.5 text-xs">
                {selectedWidget.type === 'INSTRUCTION_BOX' && (
                  <>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Widget Title</label>
                      <input
                        type="text"
                        disabled={isImmutable}
                        value={selectedWidget.props.title || ''}
                        onChange={(e) => handleUpdateWidgetProps({ title: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-[#714B67]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Instruction Text</label>
                      <textarea
                        rows={3}
                        disabled={isImmutable}
                        value={selectedWidget.props.text || ''}
                        onChange={(e) => handleUpdateWidgetProps({ text: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 leading-relaxed focus:outline-none focus:border-[#714B67]"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.type === 'CALLOUT_ALERT' && (
                  <>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Alert Severity</label>
                      <select
                        disabled={isImmutable}
                        value={selectedWidget.props.level || 'WARNING'}
                        onChange={(e) => handleUpdateWidgetProps({ level: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
                      >
                        <option value="WARNING">WARNING (Yellow / Amber)</option>
                        <option value="DANGER">DANGER / CRITICAL (Red)</option>
                        <option value="INFO">INFO / PPE (Blue)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Heading</label>
                      <input
                        type="text"
                        disabled={isImmutable}
                        value={selectedWidget.props.title || ''}
                        onChange={(e) => handleUpdateWidgetProps({ title: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Warning Description</label>
                      <textarea
                        rows={2}
                        disabled={isImmutable}
                        value={selectedWidget.props.text || ''}
                        onChange={(e) => handleUpdateWidgetProps({ text: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.type === 'NUMERIC_TOLERANCE' && (
                  <>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Checkpoint Label</label>
                      <input
                        type="text"
                        disabled={isImmutable}
                        value={selectedWidget.props.label || ''}
                        onChange={(e) => handleUpdateWidgetProps({ label: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="block text-gray-600 font-semibold mb-0.5 text-[10px]">Unit (UoM)</label>
                        <input
                          type="text"
                          disabled={isImmutable}
                          value={selectedWidget.props.unit || ''}
                          onChange={(e) => handleUpdateWidgetProps({ unit: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-semibold mb-0.5 text-[10px]">Nominal</label>
                        <input
                          type="number"
                          disabled={isImmutable}
                          value={selectedWidget.props.nominal ?? 0}
                          onChange={(e) => handleUpdateWidgetProps({ nominal: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-gray-300 rounded font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-semibold mb-0.5 text-[10px]">Min (LSL)</label>
                        <input
                          type="number"
                          disabled={isImmutable}
                          value={selectedWidget.props.min ?? 0}
                          onChange={(e) => handleUpdateWidgetProps({ min: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-gray-300 rounded font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-semibold mb-0.5 text-[10px]">Max (USL)</label>
                        <input
                          type="number"
                          disabled={isImmutable}
                          value={selectedWidget.props.max ?? 0}
                          onChange={(e) => handleUpdateWidgetProps({ max: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-gray-300 rounded font-mono text-xs"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-1.5 mt-1 font-medium text-gray-700 text-[11px]">
                      <input
                        type="checkbox"
                        disabled={isImmutable}
                        checked={selectedWidget.props.required ?? true}
                        onChange={(e) => handleUpdateWidgetProps({ required: e.target.checked })}
                        className="accent-[#714B67] w-3.5 h-3.5"
                      />
                      Mandatory checkpoint
                    </label>
                  </>
                )}

                {(selectedWidget.type === 'INSPECTION_OK_NG' || selectedWidget.type === 'CHECKLIST_TASK') && (
                  <>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Prompt / Description</label>
                      <input
                        type="text"
                        disabled={isImmutable}
                        value={selectedWidget.props.label || ''}
                        onChange={(e) => handleUpdateWidgetProps({ label: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 mt-1 font-medium text-gray-700 text-[11px]">
                      <input
                        type="checkbox"
                        disabled={isImmutable}
                        checked={selectedWidget.props.required ?? true}
                        onChange={(e) => handleUpdateWidgetProps({ required: e.target.checked })}
                        className="accent-[#714B67] w-3.5 h-3.5"
                      />
                      Mandatory checkpoint
                    </label>
                  </>
                )}

                {selectedWidget.type === 'BARCODE_SCANNER' && (
                  <>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Scan Prompt</label>
                      <input
                        type="text"
                        disabled={isImmutable}
                        value={selectedWidget.props.label || ''}
                        onChange={(e) => handleUpdateWidgetProps({ label: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Expected Prefix Filter</label>
                      <input
                        type="text"
                        disabled={isImmutable}
                        value={selectedWidget.props.prefix || ''}
                        onChange={(e) => handleUpdateWidgetProps({ prefix: e.target.value })}
                        placeholder="e.g. SN-, WO-"
                        className="w-full px-2 py-1 border border-gray-300 rounded font-mono text-xs"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.type === 'MEDIA_VIEWER' && (
                  <>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Image URL / Snapshot</label>
                      <input
                        type="text"
                        disabled={isImmutable}
                        value={selectedWidget.props.imageUrl || ''}
                        onChange={(e) => handleUpdateWidgetProps({ imageUrl: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded font-mono text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Caption</label>
                      <input
                        type="text"
                        disabled={isImmutable}
                        value={selectedWidget.props.caption || ''}
                        onChange={(e) => handleUpdateWidgetProps({ caption: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.type === 'TOOLS_MATERIALS' && (
                  <>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Tools (1 per baris)</label>
                      <textarea
                        rows={2}
                        disabled={isImmutable}
                        value={selectedWidget.props.tools?.join('\n') || ''}
                        onChange={(e) => handleUpdateWidgetProps({ tools: e.target.value.split('\n').filter(Boolean) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-0.5 text-[11px]">Materials (1 per baris)</label>
                      <textarea
                        rows={2}
                        disabled={isImmutable}
                        value={selectedWidget.props.materials?.join('\n') || ''}
                        onChange={(e) => handleUpdateWidgetProps({ materials: e.target.value.split('\n').filter(Boolean) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded font-mono text-xs"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              <div className="border-b border-gray-200 pb-2">
                <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-[#714B67] bg-[#714B67]/10 px-1.5 py-0.5 rounded">
                  PAGE & PAPER SETUP
                </span>
                <h3 className="text-xs font-bold text-gray-900 mt-1">Canvas Sheet Layout</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Standar dimensi kertas & orientasi canvas shopfloor.
                </p>
              </div>

              {/* Paper Size Compact Grid */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-700">Ukuran Kertas</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.values(PAPER_CONFIGS).map((p) => {
                    const isSelected = activePaperSize === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSetPaperSize(p.id)}
                        className={`p-1.5 rounded-md border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#714B67] bg-[#fbf5f9] ring-1 ring-[#714B67]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="font-bold text-[11px] text-gray-900 flex items-center justify-between">
                          <span>{p.name}</span>
                          {isSelected && <Check size={11} className="text-[#714B67]" />}
                        </div>
                        <div className="text-[9px] text-gray-500 font-mono">{p.dims}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orientation Compact Segmented Control */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-700">Orientasi Halaman</label>
                <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleSetOrientation('portrait')}
                    className={`py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeOrientation === 'portrait'
                        ? 'bg-white text-[#714B67] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="w-2.5 h-3.5 border border-current rounded-2xs" />
                    <span>Portrait</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetOrientation('landscape')}
                    className={`py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeOrientation === 'landscape'
                        ? 'bg-white text-[#714B67] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="w-3.5 h-2.5 border border-current rounded-2xs" />
                    <span>Landscape</span>
                  </button>
                </div>
              </div>

              {/* Display Options Compact Rows */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="block text-[11px] font-bold text-gray-700">Panduan & Kop (Slide Layout)</label>
                
                <div>
                  <label className="block text-[10px] text-gray-600 font-semibold mb-1">Tampilan Kop / Header:</label>
                  <select
                    value={canvasSettings.titleBlockStyle}
                    onChange={(e) => setCanvasSettings({ ...canvasSettings, titleBlockStyle: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white text-gray-800 font-medium"
                  >
                    <option value="iso_header">Kop Standar ISO 7200 (Engineering)</option>
                    <option value="minimal">Minimal Step Header (Simple)</option>
                    <option value="none">Tanpa Kop (Blank Slide / PowerPoint Mode)</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-1.5 rounded-md border border-gray-200 bg-white cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="text-[11px] font-semibold text-gray-800">Batas Margin (10mm)</div>
                    <div className="text-[9px] text-gray-500">Garis batas aman cetak</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={canvasSettings.showMargins}
                    onChange={(e) => setCanvasSettings({
                      ...canvasSettings,
                      showMargins: e.target.checked
                    })}
                    className="accent-[#714B67] w-3.5 h-3.5 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-1.5 rounded-md border border-gray-200 bg-white cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="text-[11px] font-semibold text-gray-800">Engineering Dot Grid</div>
                    <div className="text-[9px] text-gray-500">Kisi titik-titik panduan</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={canvasSettings.showGrid}
                    onChange={(e) => setCanvasSettings({
                      ...canvasSettings,
                      showGrid: e.target.checked
                    })}
                    className="accent-[#714B67] w-3.5 h-3.5 cursor-pointer"
                  />
                </label>
              </div>

              {/* Quick Print Export button */}
              <div className="pt-1.5">
                <button
                  type="button"
                  data-testid="print-inspector-btn"
                  onClick={() => setShowPrintModal(true)}
                  className="w-full py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-md flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer size={12} />
                  Print / Save to PDF
                </button>
              </div>
            </div>
          )}

          {/* Right Footer Summary */}
          <div className="p-2.5 border-t border-gray-200 bg-[#f8f9fa] text-[11px] text-gray-500 flex items-center justify-between">
            <span>Doc ID:</span>
            <span className="font-mono font-bold text-gray-800">{wi.id}</span>
          </div>
        </aside>
      </div>
    </div>

    {/* ── PRINT-ONLY PURE WI SHEETS (Muncul HANYA saat @media print) ── */}
    <div id="wi-print-document" className="hidden print:block bg-white text-black p-0 font-sans">
      {stepsToPrint.map((step, sIdx) => {
        const stepWidgets = step.widgets || [];
        return (
          <div
            key={step.id || sIdx}
            className="wi-print-page bg-white p-6 border-2 border-black rounded-lg mb-8"
            style={{
              breakAfter: sIdx < stepsToPrint.length - 1 ? 'page' : 'auto',
              pageBreakAfter: sIdx < stepsToPrint.length - 1 ? 'always' : 'auto',
              minHeight: currentOrientConfig.minHeight
            }}
          >
            {/* ISO 7200 Engineering Title Block */}
            <div className="border-2 border-black p-3 mb-4 text-xs font-mono grid grid-cols-12 gap-2 text-black bg-gray-50">
              <div className="col-span-6 border-r-2 border-black pr-2">
                <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">ORGANIZATION / SYSTEM</div>
                <div className="font-bold text-sm text-black">MAVI MES — DIGITAL WORK INSTRUCTION</div>
                <div className="text-xs text-gray-900 font-sans font-bold mt-1 truncate">{wi.title}</div>
              </div>
              <div className="col-span-3 border-r-2 border-black pr-2">
                <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">DOC NO & REVISION</div>
                <div className="font-bold text-xs text-black">{wi.doc_number}</div>
                <div className="text-[10px] text-gray-700">{wi.current_revision} • {wi.status}</div>
                <div className="text-[9px] text-gray-600 mt-1 font-bold">Part: {wi.part_number}</div>
              </div>
              <div className="col-span-3 text-right">
                <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">FORMAT & SHEET</div>
                <div className="font-bold text-xs text-black">{currentPaperConfig.id} {activeOrientation.toUpperCase()}</div>
                <div className="text-[10px] text-black font-bold">Sheet {sIdx + 1} of {stepsToPrint.length}</div>
                <div className="text-[9px] text-gray-600 mt-1">Dept: {wi.department || 'Production'}</div>
              </div>
            </div>

            {/* Step Header */}
            <div className="border-b-2 border-black pb-2 mb-4 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono tracking-widest uppercase bg-black text-white px-2 py-0.5 rounded">
                  STEP {sIdx + 1} OF {stepsToPrint.length}
                </span>
                <h2 className="text-lg font-bold text-black mt-1 font-sans">{step.title}</h2>
              </div>
              <div className="text-xs font-mono font-bold text-black border border-black px-2.5 py-1 rounded bg-gray-100">
                Target: {step.cycle_time_target_sec || 60}s
              </div>
            </div>

            {/* Step Widgets List */}
            <div className="space-y-4">
              {stepWidgets.length === 0 ? (
                <div className="p-4 border border-gray-300 text-gray-500 italic text-xs">
                  {step.instruction || 'Follow standard operating procedure.'}
                </div>
              ) : (
                stepWidgets.map((w, wIdx) => {
                  if (w.type === 'INSTRUCTION_BOX') {
                    return (
                      <div key={w.id || wIdx} className="border border-gray-400 p-3.5 rounded-md bg-white">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                          PETUNJUK OPERASI / INSTRUCTION GUIDANCE
                        </div>
                        <div className="text-sm text-black leading-relaxed font-sans font-medium whitespace-pre-wrap">
                          {w.props.text}
                        </div>
                      </div>
                    );
                  }
                  if (w.type === 'CALLOUT_ALERT') {
                    return (
                      <div key={w.id || wIdx} className="border-2 border-amber-600 bg-amber-50 p-3 rounded-md">
                        <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                          ⚠️ PERINGATAN KESELAMATAN (SAFETY & PPE PRECAUTION)
                        </div>
                        <div className="text-xs text-amber-950 font-medium">
                          {w.props.text}
                        </div>
                      </div>
                    );
                  }
                  if (w.type === 'MEDIA_VIEWER') {
                    return (
                      <div key={w.id || wIdx} className="border border-gray-400 p-2 rounded-md text-center bg-white">
                        {w.props.imageUrl && (
                          <img src={w.props.imageUrl} alt="CAD Drawing Reference" className="max-h-64 mx-auto object-contain mb-1" />
                        )}
                        <div className="text-[10px] text-gray-600 italic font-mono">
                          {w.props.caption || 'Drawing Blueprint Reference'}
                        </div>
                      </div>
                    );
                  }
                  if (w.type === 'TOOLS_MATERIALS') {
                    return (
                      <div key={w.id || wIdx} className="grid grid-cols-2 gap-3 border border-gray-400 p-3 rounded-md bg-gray-50 text-xs">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-500 mb-1 font-mono">TOOLS DIPERLUKAN:</div>
                          <ul className="list-disc list-inside space-y-0.5 text-black">
                            {w.props.tools?.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-500 mb-1 font-mono">MATERIALS / PARTS:</div>
                          <ul className="list-disc list-inside space-y-0.5 text-black">
                            {w.props.materials?.map((m, i) => <li key={i}>{m}</li>)}
                          </ul>
                        </div>
                      </div>
                    );
                  }
                  if (w.type === 'NUMERIC_TOLERANCE') {
                    return (
                      <div key={w.id || wIdx} className="border-2 border-black p-3 rounded-md bg-white">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-black">⚖️ PENGUKURAN METROLOGI: {w.props.label}</span>
                          <span className="font-mono text-xs font-bold text-black border border-black px-1.5 py-0.5 rounded">
                            Nominal: {w.props.nominal} {w.props.unit} (Tol: {w.props.min} - {w.props.max} {w.props.unit})
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-300 text-xs font-mono">
                          <span>Nilai Aktual: [ ____________________ ] {w.props.unit}</span>
                          <span className="space-x-4">
                            <span>[ &nbsp; ] OK (IN SPEC)</span>
                            <span>[ &nbsp; ] NG (OUT OF SPEC)</span>
                          </span>
                        </div>
                      </div>
                    );
                  }
                  if (w.type === 'INSPECTION_OK_NG') {
                    return (
                      <div key={w.id || wIdx} className="border-2 border-black p-3 rounded-md bg-white flex items-center justify-between text-xs">
                        <span className="font-bold text-black">🔍 VISUAL CHECK: {w.props.label}</span>
                        <span className="font-mono font-bold space-x-4">
                          <span>[ &nbsp; ] OK / PASS</span>
                          <span>[ &nbsp; ] NG / REJECT</span>
                          <span>Initials: [ _______ ]</span>
                        </span>
                      </div>
                    );
                  }
                  if (w.type === 'CHECKLIST_TASK') {
                    return (
                      <div key={w.id || wIdx} className="border border-gray-400 p-2.5 rounded-md bg-white flex items-center gap-2 text-xs">
                        <span className="w-4 h-4 border-2 border-black inline-block"></span>
                        <span className="font-semibold text-black">{w.props.label}</span>
                      </div>
                    );
                  }
                  if (w.type === 'BARCODE_SCANNER') {
                    return (
                      <div key={w.id || wIdx} className="border border-gray-400 p-2.5 rounded-md bg-white text-xs font-mono">
                        <div className="font-bold text-black mb-1">SCAN TRACEABILITY: {w.props.label} (Prefix: {w.props.prefix || 'None'})</div>
                        <div>Serial No: [ __________________________________________________ ]</div>
                      </div>
                    );
                  }
                  if (w.type === 'SIGNATURE_PAD') {
                    return (
                      <div key={w.id || wIdx} className="border-2 border-black p-3 rounded-md bg-white flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-black">{w.props.label}</div>
                          <div className="text-[10px] text-gray-500">Sign-off otorisasi perakitan / QA</div>
                        </div>
                        <div className="text-right font-mono text-xs">
                          <div>Tanda Tangan: __________________________</div>
                          <div className="mt-1">Nama / NIK: ________________  Tgl: _________</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })
              )}
            </div>

            {/* Bottom Sign-off Footer */}
            <div className="mt-6 pt-3 border-t-2 border-black grid grid-cols-3 gap-4 text-[10px] font-mono text-black">
              <div className="border-t border-gray-400 pt-1">
                <div>OPERATOR ASSEMBLY:</div>
                <div className="mt-5">Nama / TTD: _________________</div>
              </div>
              <div className="border-t border-gray-400 pt-1">
                <div>QUALITY INSPECTOR:</div>
                <div className="mt-5">Nama / TTD: _________________</div>
              </div>
              <div className="border-t border-gray-400 pt-1 text-right">
                <div>LINE SUPERVISOR:</div>
                <div className="mt-5">Nama / TTD: _________________</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </>
);
}
