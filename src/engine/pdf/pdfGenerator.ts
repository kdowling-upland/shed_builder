import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ShedDesign } from '../../types/shed.ts';
import type { BuildPlan } from '../../types/buildPlan.ts';
import type { CutItem } from '../calculator/cutlist.ts';
import { formatInches } from '../calculator/cutlist.ts';
import { formatCurrency } from '../../utils/formatting.ts';
import type { MaterialCategory } from '../../types/materials.ts';

// ── Colors ──
const BLACK = '#1a1a1a';
const DARK = '#333333';
const MID = '#666666';
const LIGHT_BG = '#f5f5f5';
const ACCENT = '#2563eb';
const WHITE = '#ffffff';

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  foundation: 'Foundation',
  floor: 'Floor Framing',
  walls: 'Wall Framing',
  roof: 'Roofing',
  siding: 'Siding',
  openings: 'Doors & Windows',
  fasteners: 'Fasteners & Hardware',
};

const PHASE_LABELS: Record<string, string> = {
  foundation: 'Foundation',
  floor: 'Floor',
  walls: 'Walls',
  roof: 'Roof',
  trim: 'Trim',
};

function addPageFooter(doc: jsPDF, designName: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(MID);
    doc.text(`${designName} — Build Plan`, 20, ph - 10);
    doc.text(`Page ${i} of ${pageCount}`, pw - 20, ph - 10, { align: 'right' });
  }
}

function ensureSpace(doc: jsPDF, needed: number, y: number): number {
  const ph = doc.internal.pageSize.getHeight();
  if (y + needed > ph - 25) {
    doc.addPage();
    return 25;
  }
  return y;
}

export function generatePDF(
  design: ShedDesign,
  buildPlan: BuildPlan,
  cutList: CutItem[],
  canvasImage: string | null,
): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const pw = doc.internal.pageSize.getWidth();  // ~216mm
  const margin = 20;
  const contentW = pw - margin * 2;
  let y = 20;

  // ═══════════════════════════════════════
  // PAGE 1: COVER
  // ═══════════════════════════════════════

  // Title bar
  doc.setFillColor(ACCENT);
  doc.rect(0, 0, pw, 40, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(WHITE);
  doc.text('BUILD PLAN', margin, 27);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(design.name, pw - margin, 27, { align: 'right' });

  y = 50;

  // Shed image
  if (canvasImage) {
    const imgW = contentW;
    const imgH = imgW * 0.55;
    doc.addImage(canvasImage, 'PNG', margin, y, imgW, imgH);
    y += imgH + 10;
  } else {
    y += 5;
  }

  // Specs box
  doc.setFillColor(LIGHT_BG);
  doc.roundedRect(margin, y, contentW, 48, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(ACCENT);
  doc.text('SPECIFICATIONS', margin + 6, y + 8);

  doc.setFontSize(10);
  doc.setTextColor(DARK);
  doc.setFont('helvetica', 'normal');

  const specCol1 = margin + 6;
  const specCol2 = margin + contentW / 3;
  const specCol3 = margin + (contentW * 2) / 3;
  const specY1 = y + 16;
  const specY2 = y + 24;
  const specY3 = y + 32;
  const specY4 = y + 40;

  const specs = [
    ['Footprint', `${design.width}' x ${design.length}' (${design.width * design.length} sq ft)`],
    ['Wall Height', `${design.wallHeight}'`],
    ['Roof', `${design.roof.style.charAt(0).toUpperCase() + design.roof.style.slice(1)} — ${design.roof.pitch}/12 pitch`],
    ['Overhang', `${design.roof.overhang}"`],
    ['Foundation', design.foundation.replace(/-/g, ' ')],
    ['Siding', design.siding.replace(/-/g, ' ')],
    ['Stud Framing', `${design.framing.studSize} @ ${design.framing.studSpacing}" O.C.`],
    ['Joist Framing', `${design.framing.joistSize} @ ${design.framing.joistSpacing}" O.C.`],
    ['Rafter Framing', `${design.framing.rafterSize} @ ${design.framing.rafterSpacing}" O.C.`],
  ];

  const rows = [specY1, specY2, specY3, specY4, specY1, specY2, specY3, specY4, specY1];
  const cols = [specCol1, specCol1, specCol1, specCol1, specCol2, specCol2, specCol2, specCol2, specCol3];
  // Lay out as 3 columns
  const perCol = 3;
  for (let i = 0; i < specs.length; i++) {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const x = col === 0 ? specCol1 : col === 1 ? specCol2 : specCol3;
    const sy = specY1 + row * 9;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(MID);
    doc.text(specs[i][0], x, sy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(BLACK);
    doc.text(specs[i][1], x, sy + 4.5);
  }

  void rows; void cols; // used via loop above

  y += 56;

  // Cost summary
  doc.setFillColor(ACCENT);
  doc.roundedRect(margin, y, contentW, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(WHITE);
  doc.text('ESTIMATED TOTAL COST', margin + 6, y + 9.5);
  doc.text(formatCurrency(buildPlan.totalCost), pw - margin - 6, y + 9.5, { align: 'right' });

  y += 20;

  // Cost breakdown mini-table
  const categoryCosts: Record<string, number> = {};
  for (const item of buildPlan.materials) {
    categoryCosts[item.category] = (categoryCosts[item.category] ?? 0) + item.totalPrice;
  }

  doc.setFontSize(9);
  for (const [cat, cost] of Object.entries(categoryCosts)) {
    doc.setTextColor(MID);
    doc.setFont('helvetica', 'normal');
    doc.text(CATEGORY_LABELS[cat as MaterialCategory] ?? cat, margin + 6, y);
    doc.setTextColor(BLACK);
    doc.text(formatCurrency(cost), pw - margin - 6, y, { align: 'right' });
    y += 5;
  }

  y += 4;
  doc.setFontSize(7);
  doc.setTextColor(MID);
  doc.text('* Prices are approximate US averages. Actual costs vary by region and market conditions.', margin + 6, y);

  // ═══════════════════════════════════════
  // PAGE 2+: MATERIALS SHOPPING LIST
  // ═══════════════════════════════════════
  doc.addPage();
  y = 20;

  // Section header
  doc.setFillColor(ACCENT);
  doc.rect(0, y - 5, pw, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(WHITE);
  doc.text('SHOPPING LIST', margin, y + 5);
  y += 18;

  const grouped = new Map<string, typeof buildPlan.materials>();
  for (const item of buildPlan.materials) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  const categoryOrder = ['foundation', 'floor', 'walls', 'roof', 'siding', 'openings', 'fasteners'];

  for (const cat of categoryOrder) {
    const items = grouped.get(cat);
    if (!items?.length) continue;

    y = ensureSpace(doc, 20, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(ACCENT);
    doc.text(CATEGORY_LABELS[cat as MaterialCategory] ?? cat, margin, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Item', 'Qty', 'Unit', 'Unit Price', 'Total']],
      body: items.map((item) => [
        item.name + (item.description ? `\n${item.description}` : ''),
        String(item.quantity),
        item.unit,
        formatCurrency(item.unitPrice),
        formatCurrency(item.totalPrice),
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: DARK,
        lineColor: '#e0e0e0',
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: '#e8e8e8',
        textColor: BLACK,
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 16 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'right', cellWidth: 24 },
        4: { halign: 'right', cellWidth: 24, fontStyle: 'bold' },
      },
      alternateRowStyles: { fillColor: '#fafafa' },
    });

    y = ((doc as unknown as Record<string, Record<string, number>>).lastAutoTable?.finalY) ?? y + 30;
    y += 6;
  }

  // ═══════════════════════════════════════
  // CUT LIST
  // ═══════════════════════════════════════
  doc.addPage();
  y = 20;

  doc.setFillColor(ACCENT);
  doc.rect(0, y - 5, pw, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(WHITE);
  doc.text('CUT LIST', margin, y + 5);
  y += 18;

  doc.setFontSize(8);
  doc.setTextColor(MID);
  doc.text('Every piece of lumber you need to cut, organized by construction phase.', margin, y);
  y += 6;

  // Group cuts by phase
  const phaseOrder = ['foundation', 'floor', 'walls', 'roof', 'trim'];
  const cutsByPhase = new Map<string, CutItem[]>();
  for (const cut of cutList) {
    const list = cutsByPhase.get(cut.phase) ?? [];
    list.push(cut);
    cutsByPhase.set(cut.phase, list);
  }

  let cutNumber = 1;

  for (const phase of phaseOrder) {
    const phaseCuts = cutsByPhase.get(phase);
    if (!phaseCuts?.length) continue;

    y = ensureSpace(doc, 20, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(ACCENT);
    doc.text(PHASE_LABELS[phase] ?? phase, margin, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Lumber', 'Stock', 'Cut To', 'Qty', 'Purpose']],
      body: phaseCuts.map((cut) => {
        const row = [
          String(cutNumber),
          cut.lumberSize,
          `${cut.stockLength}'`,
          formatInches(cut.cutLengthInches),
          `x${cut.qty}`,
          cut.label,
        ];
        cutNumber++;
        return row;
      }),
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: DARK,
        lineColor: '#e0e0e0',
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: '#e8e8e8',
        textColor: BLACK,
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10, fontStyle: 'bold' },
        1: { cellWidth: 22, fontStyle: 'bold' },
        2: { halign: 'center', cellWidth: 14 },
        3: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
        4: { halign: 'center', cellWidth: 12 },
        5: { cellWidth: 'auto' },
      },
      alternateRowStyles: { fillColor: '#fafafa' },
    });

    y = ((doc as unknown as Record<string, Record<string, number>>).lastAutoTable?.finalY) ?? y + 30;
    y += 6;
  }

  // ═══════════════════════════════════════
  // CONSTRUCTION STEPS
  // ═══════════════════════════════════════
  doc.addPage();
  y = 20;

  doc.setFillColor(ACCENT);
  doc.rect(0, y - 5, pw, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(WHITE);
  doc.text('STEP-BY-STEP INSTRUCTIONS', margin, y + 5);
  y += 20;

  for (const step of buildPlan.steps) {
    // Estimate height needed for this step
    const descLines = doc.splitTextToSize(step.description, contentW - 22);
    const neededH = 18 + descLines.length * 4 + (step.materials.length > 0 ? 8 : 0);
    y = ensureSpace(doc, neededH, y);

    // Step number circle
    doc.setFillColor(ACCENT);
    doc.circle(margin + 5, y + 3, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(WHITE);
    const numStr = String(step.stepNumber);
    doc.text(numStr, margin + 5, y + 4.5, { align: 'center' });

    // Step title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(BLACK);
    doc.text(step.title, margin + 14, y + 5);
    y += 12;

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(DARK);
    doc.text(descLines, margin + 14, y);
    y += descLines.length * 4 + 2;

    // Materials for this step
    if (step.materials.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(MID);
      doc.text('Materials: ' + step.materials.join(', '), margin + 14, y);
      y += 5;
    }

    // Divider
    y += 3;
    doc.setDrawColor('#e0e0e0');
    doc.setLineWidth(0.3);
    doc.line(margin + 14, y, pw - margin, y);
    y += 6;
  }

  // ── Page footers ──
  addPageFooter(doc, design.name);

  return doc;
}
