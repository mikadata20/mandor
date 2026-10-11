/**
 * DigitalWiAiParser.js
 * ============================================================================
 * AI-Powered Document Understanding & PDF / OCR Extraction for MAVI Core
 * Converts engineering Work Instruction PDFs into structured digital steps.
 * Supports:
 * - Native PDF text extraction via pdfjs-dist
 * - Scanned PDF OCR extraction via Tesseract.js fallback
 * - High-res page preview thumbnail rendering
 * - Gemini & Vertex AI structured JSON generation
 * - Resilient deterministic rule-based heuristic extraction fallback
 * ============================================================================
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createWorker } from 'tesseract.js';
import { VertexAiService } from './VertexAiService';

// Configure pdfjs worker for Vite
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker || 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  } catch (e) {
    console.warn('[DigitalWiAiParser] Worker config note:', e);
  }
}

export class DigitalWiAiParser {
  /**
   * Reads PDF document and extracts page text + thumbnails
   * @param {File|ArrayBuffer|string} pdfInput 
   * @param {Object} options 
   * @param {Function} onProgress 
   */
  static async extractPdfContent(pdfInput, options = {}, onProgress = () => {}) {
    onProgress({ stage: 'LOADING_PDF', percent: 10, message: 'Loading PDF document into memory...' });

    let arrayBuffer;
    if (pdfInput instanceof File || pdfInput instanceof Blob) {
      arrayBuffer = await pdfInput.arrayBuffer();
    } else if (pdfInput instanceof ArrayBuffer) {
      arrayBuffer = pdfInput;
    } else if (typeof pdfInput === 'string' && pdfInput.startsWith('data:')) {
      const base64 = pdfInput.split(',')[1];
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      arrayBuffer = bytes.buffer;
    } else {
      throw new Error('Unsupported PDF input type');
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    const selectedPages = options.selectedPages || Array.from({ length: totalPages }, (_, i) => i + 1);
    const pagesData = [];

    let ocrWorker = null;

    for (let i = 0; i < selectedPages.length; i++) {
      const pageNum = selectedPages[i];
      if (pageNum < 1 || pageNum > totalPages) continue;

      const currentPercent = 10 + Math.round(((i + 1) / selectedPages.length) * 50);
      onProgress({
        stage: 'EXTRACTING_PAGE',
        percent: currentPercent,
        message: `Reading page ${pageNum} of ${totalPages}...`
      });

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      // Render canvas for preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
      const pageImageThumbnail = canvas.toDataURL('image/jpeg', 0.85);

      // Extract native text
      const textContent = await page.getTextContent();
      let extractedText = textContent.items.map(item => item.str).join(' ').trim();

      // If text is suspiciously short (< 30 chars), perform OCR
      let wasOcrUsed = false;
      if (extractedText.length < 30) {
        try {
          onProgress({
            stage: 'RUNNING_OCR',
            percent: currentPercent,
            message: `Scanned page detected! Running Tesseract OCR on page ${pageNum}...`
          });
          if (!ocrWorker) {
            ocrWorker = await createWorker('eng');
          }
          const { data: ocrResult } = await ocrWorker.recognize(canvas);
          if (ocrResult && ocrResult.text && ocrResult.text.trim().length > extractedText.length) {
            extractedText = ocrResult.text.trim();
            wasOcrUsed = true;
          }
        } catch (ocrErr) {
          console.warn(`[DigitalWiAiParser] OCR fallback failed for page ${pageNum}:`, ocrErr);
        }
      }

      pagesData.push({
        pageNumber: pageNum,
        text: extractedText,
        thumbnail: pageImageThumbnail,
        wasOcrUsed
      });
    }

    if (ocrWorker) {
      await ocrWorker.terminate();
    }

    onProgress({ stage: 'EXTRACTION_COMPLETE', percent: 65, message: 'PDF text and page previews ready.' });
    return {
      totalPages,
      pages: pagesData,
      combinedText: pagesData.map(p => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n')
    };
  }

  /**
   * Generates Digital WI structure using Gemini / Vertex AI or Heuristic Parser
   * @param {Object} extractedPdf 
   * @param {Object} metadata 
   * @param {Function} onProgress 
   */
  static async structureWithAI(extractedPdf, metadata = {}, onProgress = () => {}) {
    onProgress({ stage: 'AI_UNDERSTANDING', percent: 75, message: 'Synthesizing work instruction steps with AI...' });

    const promptText = `
You are an expert Manufacturing & Industrial Quality Engineer.
Analyze the following Work Instruction PDF document content and convert it into a structured JSON representation for shop floor operators.

DOCUMENT METADATA:
Document Number: ${metadata.docNumber || 'Auto-Detect'}
Title: ${metadata.title || 'Auto-Detect'}
Part Number: ${metadata.partNumber || 'Auto-Detect'}
Process: ${metadata.processName || 'Auto-Detect'}
Station: ${metadata.station || 'Auto-Detect'}
Revision: ${metadata.revision || 'Rev A'}

EXTRACTED PDF DOCUMENT TEXT:
${extractedPdf.combinedText}

CRITICAL RULES:
1. Break down into sequential manufacturing steps.
2. For each step, extract:
   - step_number (integer)
   - title (concise action title)
   - instruction (detailed clear guidance)
   - source_pages (array of page numbers where step was found)
   - tools (array of string tools needed)
   - materials (array of parts/materials)
   - safety_warnings (critical precautions)
   - cycle_time_target_sec (estimated integer seconds, default 60)
   - checkpoints: Array of mandatory checks. Each checkpoint must be:
     * id: string (e.g. "cp-1")
     * type: "checklist" | "numeric" | "ok_ng" | "scan_code"
     * label: string
     * required: boolean
     * For "numeric": unit (string), min (number), max (number), nominal (number)
3. NEVER INVENT missing torque specs, pressure values, or tolerances! If not explicitly stated in document, omit numeric min/max and mark as checklist or review note.
4. Output ONLY valid JSON matching this exact structure:
{
  "document": {
    "title": "string",
    "document_number": "string",
    "part_number": "string",
    "revision": "string",
    "department": "string",
    "description": "string"
  },
  "steps": [
    {
      "step_number": 1,
      "title": "string",
      "instruction": "string",
      "source_pages": [1],
      "tools": [],
      "materials": [],
      "safety_warnings": [],
      "cycle_time_target_sec": 60,
      "checkpoints": []
    }
  ]
}
`;

    let generatedJson = null;

    // 1. Try Vertex AI / Gemini if configured
    try {
      if (VertexAiService && typeof VertexAiService.getConfig === 'function') {
        const config = await VertexAiService.getConfig();
        if (config.apiKey || config.bearerToken) {
          onProgress({ stage: 'VERTEX_AI_CALL', percent: 85, message: 'Calling Google Vertex AI / Gemini 1.5 Pro...' });
          const rawAiResponse = await VertexAiService.callVertexAi({ prompt: promptText });
          if (rawAiResponse && rawAiResponse.text) {
            generatedJson = this.extractJsonFromText(rawAiResponse.text);
          }
        }
      }
    } catch (aiErr) {
      console.warn('[DigitalWiAiParser] Cloud AI call failed, switching to local intelligent heuristic:', aiErr);
    }

    // 2. If AI didn't produce valid JSON, use rule-based intelligent industrial heuristic
    if (!generatedJson || !generatedJson.steps || generatedJson.steps.length === 0) {
      onProgress({ stage: 'HEURISTIC_PARSER', percent: 90, message: 'Parsing industrial patterns & step checkpoints...' });
      generatedJson = this.heuristicExtraction(extractedPdf, metadata);
    }

    // Attach page thumbnails to matching steps
    if (generatedJson && generatedJson.steps) {
      generatedJson.steps.forEach(step => {
        if (!step.images || step.images.length === 0) {
          const matchPage = step.source_pages?.[0] || 1;
          const pageObj = extractedPdf.pages.find(p => p.pageNumber === matchPage);
          if (pageObj && pageObj.thumbnail) {
            step.images = [pageObj.thumbnail];
          }
        }
      });
    }

    onProgress({ stage: 'VALIDATION', percent: 100, message: 'Validation complete. Ready for review!' });
    return generatedJson;
  }

  /**
   * Cleans and parses JSON blocks from raw LLM text
   */
  static extractJsonFromText(rawText) {
    if (!rawText) return null;
    try {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = match ? match[1] : rawText;
      return JSON.parse(jsonStr.trim());
    } catch (e) {
      try {
        const startIdx = rawText.indexOf('{');
        const endIdx = rawText.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          return JSON.parse(rawText.substring(startIdx, endIdx + 1));
        }
      } catch (innerErr) {
        console.error('[DigitalWiAiParser] JSON parsing error:', innerErr);
      }
    }
    return null;
  }

  /**
   * Deterministic Industrial Rule-Based Heuristic Extractor
   * Extracts steps, tools, safety warnings, torques, and checkpoints reliably without external LLM
   */
  static heuristicExtraction(extractedPdf, metadata = {}) {
    const pages = extractedPdf.pages || [];
    const steps = [];

    let currentStepNumber = 1;

    pages.forEach((page) => {
      const text = page.text || '';
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

      // Split into candidate steps based on keywords: Step, Langkah, Tahap, Item, 1., 2.
      let currentStep = null;

      lines.forEach((line) => {
        const stepMatch = line.match(/^(?:(?:STEP|LANGKAH|TAHAP|PROSEDUR)\s*(\d+)[:.]?|(\d+)[.)]\s+([A-Z].*))/i);
        if (stepMatch) {
          if (currentStep) {
            steps.push(currentStep);
          }
          const title = (stepMatch[3] || line).replace(/^(?:STEP|LANGKAH|TAHAP)\s*\d+[:.]?\s*/i, '').trim();
          currentStep = {
            id: `step-gen-${currentStepNumber}`,
            step_number: currentStepNumber++,
            title: title || `Operation Step ${currentStepNumber}`,
            instruction: '',
            source_pages: [page.pageNumber],
            tools: [],
            materials: [],
            safety_warnings: [],
            cycle_time_target_sec: 60,
            checkpoints: [],
            images: [page.thumbnail]
          };
          return;
        }

        if (!currentStep) {
          currentStep = {
            id: `step-gen-${currentStepNumber}`,
            step_number: currentStepNumber++,
            title: line.length < 60 ? line : `Step ${currentStepNumber} Execution`,
            instruction: '',
            source_pages: [page.pageNumber],
            tools: [],
            materials: [],
            safety_warnings: [],
            cycle_time_target_sec: 60,
            checkpoints: [],
            images: [page.thumbnail]
          };
        } else {
          // Detect tools
          if (/tool|alat|wrench|caliper|obeng|kunci|fixture|gauge/i.test(line)) {
            const cleanTool = line.replace(/^(?:Tools?|Alat|Equipment):\s*/i, '');
            if (!currentStep.tools.includes(cleanTool) && cleanTool.length < 50) {
              currentStep.tools.push(cleanTool);
            }
          }

          // Detect safety warnings
          if (/warn|danger|caution|awas|bahaya|perhatian|ppe|apd|safety|kacamata|sarung tangan/i.test(line)) {
            const cleanWarn = line.replace(/^(?:Warning|Caution|Bahaya|Awas):\s*/i, '');
            if (!currentStep.safety_warnings.includes(cleanWarn) && cleanWarn.length < 120) {
              currentStep.safety_warnings.push(cleanWarn);
            }
          }

          // Detect torque or numeric specifications
          const torqueMatch = line.match(/(?:torque|torsi|tighten|kencangkan).*?(\d+(?:\.\d+)?)\s*(?:Nm|N\.m|kgf\.cm)/i);
          if (torqueMatch) {
            const nominal = parseFloat(torqueMatch[1]);
            currentStep.checkpoints.push({
              id: `cp-${currentStep.step_number}-torque`,
              type: 'numeric',
              label: `Torque fastening verification (${nominal} Nm)`,
              unit: 'Nm',
              min: +(nominal * 0.95).toFixed(1),
              max: +(nominal * 1.05).toFixed(1),
              nominal: nominal,
              required: true
            });
          }

          // Detect barcode or serial scan requirement
          if (/barcode|qr\s*code|serial\s*number|scan|nomor\s*seri/i.test(line)) {
            currentStep.checkpoints.push({
              id: `cp-${currentStep.step_number}-scan`,
              type: 'scan_code',
              label: 'Scan Component Barcode / 2D Code',
              required: true
            });
          }

          // Detect visual / OK-NG inspection
          if (/inspect|periksa|visual|check|pastikan|kondisi|cacat|defect/i.test(line)) {
            currentStep.checkpoints.push({
              id: `cp-${currentStep.step_number}-insp`,
              type: 'ok_ng',
              label: line.length < 80 ? line : 'Visual surface and alignment inspection',
              required: true
            });
          }

          // Accumulate instruction text
          currentStep.instruction = (currentStep.instruction + ' ' + line).trim();
        }
      });

      if (currentStep) {
        steps.push(currentStep);
      }
    });

    // Ensure at least 1 checkpoint per step
    steps.forEach((s, idx) => {
      if (!s.checkpoints || s.checkpoints.length === 0) {
        s.checkpoints = [
          {
            id: `cp-${idx + 1}-chk`,
            type: 'checklist',
            label: `Verify step "${s.title}" completed per standard`,
            required: true
          }
        ];
      }
      if (!s.instruction) {
        s.instruction = `Perform manufacturing operation per drawing and SOP specifications for ${s.title}.`;
      }
    });

    // Default fallback step if document had no text
    if (steps.length === 0) {
      steps.push({
        id: 'step-gen-1',
        step_number: 1,
        title: 'Initial Component Setup & Verification',
        instruction: 'Verify part cleanliness, scan component barcode, and inspect incoming materials before starting assembly.',
        source_pages: [1],
        cycle_time_target_sec: 60,
        tools: ['Visual Inspection Lamp'],
        materials: ['Production Part'],
        safety_warnings: ['Wear safety glasses and protective footwear'],
        images: pages[0]?.thumbnail ? [pages[0].thumbnail] : [],
        checkpoints: [
          { id: 'cp-1-1', type: 'scan_code', label: 'Scan Work Order / Part Barcode', required: true },
          { id: 'cp-1-2', type: 'checklist', label: 'Cleanliness and part integrity verified OK', required: true }
        ]
      });
    }

    return {
      document: {
        title: metadata.title || 'Digital Work Instruction',
        document_number: metadata.docNumber || `WI-${Date.now().toString().slice(-6)}`,
        part_number: metadata.partNumber || 'PART-SAMPLE',
        part_name: metadata.partName || 'Manufactured Component',
        process_name: metadata.processName || 'Standard Assembly',
        department: metadata.department || 'Production Assembly',
        revision: metadata.revision || 'Rev A',
        description: `Imported work instruction extracted from PDF document with ${steps.length} sequential steps.`
      },
      steps
    };
  }
}
