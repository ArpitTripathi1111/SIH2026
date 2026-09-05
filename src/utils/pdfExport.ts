/**
 * Team CODE TITANS - SIH26051
 * Client-side High-Resolution A4 Engineering PDF Generator
 * Powered by html2canvas and jsPDF for reliable export in all browser & iframe environments
 */

import { jsPDF } from 'jspdf';
import html2canvasPro from 'html2canvas-pro';

const html2canvas: typeof html2canvasPro = (html2canvasPro as any).default || html2canvasPro;

export interface PdfExportOptions {
  filename?: string;
  onProgress?: (stage: string) => void;
}

/**
 * Generates and downloads a multi-page A4 PDF dossier directly from an HTML element.
 * Works seamlessly in sandboxed iframes, mobile browsers, and desktop browsers
 * where native window.print() is restricted or blocked.
 */
export async function exportReportToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const {
    filename = 'SIH26051_Shelter_Thermal_Report.pdf',
    onProgress
  } = options;

  try {
    onProgress?.('Preparing engineering dossier elements...');

    // Wait 100ms to ensure all charts, fonts and SVGs are fully settled
    await new Promise((resolve) => setTimeout(resolve, 150));

    onProgress?.('Rasterizing high-resolution CAD & thermodynamic models (2× scale)...');

    const canvas = await html2canvas(element, {
      scale: 2, // 2x device pixel ratio for sharp text, vectors, and numbers
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
      ignoreElements: (el) => {
        return (
          el.classList.contains('no-print') ||
          el.classList.contains('print-hide') ||
          el.hasAttribute('data-no-print')
        );
      },
      onclone: (clonedDoc) => {
        // Ensure the cloned container is rendered on clean white with exact layout
        const clonedReport = clonedDoc.getElementById('printable-dossier');
        if (clonedReport) {
          clonedReport.style.maxWidth = '1000px';
          clonedReport.style.width = '1000px';
          clonedReport.style.margin = '0 auto';
          clonedReport.style.padding = '24px 32px';
          clonedReport.style.backgroundColor = '#ffffff';
          clonedReport.style.color = '#0f172a';
          clonedReport.style.boxShadow = 'none';
          clonedReport.style.border = 'none';
        }
      }
    });

    onProgress?.('Compiling A4 multi-page engineering document...');

    // A4 dimensions in mm: 210mm wide × 297mm high
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10; // 10mm margins
    const contentWidth = pageWidth - 2 * margin; // 190mm
    const contentHeight = pageHeight - 2 * margin; // 277mm

    // Calculate total height of the scaled image in PDF mm
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    let heightLeft = imgHeight;
    let position = margin;
    let pageNum = 1;

    // First page
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
    
    // Add page number footer in margin
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Page ${pageNum} • SIH26051 Engineering Dossier`, pageWidth - margin - 50, pageHeight - 5);

    heightLeft -= contentHeight;

    // Subsequent pages if dossier height exceeds standard A4 page
    while (heightLeft > 5) {
      position = -(pageNum * contentHeight) + margin;
      pdf.addPage();
      pageNum++;
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Page ${pageNum} • SIH26051 Engineering Dossier`, pageWidth - margin - 50, pageHeight - 5);
      
      heightLeft -= contentHeight;
    }

    onProgress?.('Saving PDF file to your downloads...');
    pdf.save(filename);

    return { success: true };
  } catch (err: any) {
    console.error('Error generating PDF dossier:', err);
    return {
      success: false,
      error: err?.message || 'Failed to generate PDF document'
    };
  }
}
