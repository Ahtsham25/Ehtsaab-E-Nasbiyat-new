import * as pdfjsLib from 'pdfjs-dist';
// Vite URL worker import
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure the worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export type PDFDocumentProxy = pdfjsLib.PDFDocumentProxy;

/**
 * Load a PDF document from URL, Blob, File, or ArrayBuffer
 */
export async function loadPdfDocument(source: string | Blob | ArrayBuffer): Promise<PDFDocumentProxy> {
  let loadingTask: ReturnType<typeof pdfjsLib.getDocument>;

  if (source instanceof Blob) {
    const arrayBuffer = await source.arrayBuffer();
    loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  } else if (source instanceof ArrayBuffer) {
    loadingTask = pdfjsLib.getDocument({ data: source });
  } else if (typeof source === 'string') {
    loadingTask = pdfjsLib.getDocument({
      url: source,
      withCredentials: false,
    });
  } else {
    throw new Error('نامعلوم پی ڈی ایف سورس');
  }

  return await loadingTask.promise;
}

/**
 * Render a single page onto an HTML5 canvas
 */
export async function renderPageToCanvas(
  pdfDoc: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  userScale: number = 1.0
): Promise<void> {
  const page = await pdfDoc.getPage(pageNumber);

  // Calculate proper viewport considering device pixel ratio for sharp crisp text
  const dpr = window.devicePixelRatio || 1;
  const initialViewport = page.getViewport({ scale: 1.0 });

  // Compute scale to fit comfortably in container
  const baseScale = Math.min((window.innerWidth * 0.9) / initialViewport.width, 1.6);
  const finalScale = baseScale * userScale;
  const viewport = page.getViewport({ scale: finalScale * dpr });

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = `${viewport.width / dpr}px`;
  canvas.style.height = `${viewport.height / dpr}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;
}

/**
 * Render page 1 and export as image data URL for thumbnail/cover preview
 */
export async function generateFirstPageThumbnail(pdfDoc: PDFDocumentProxy): Promise<string> {
  try {
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 0.8 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return '';
  }
}
