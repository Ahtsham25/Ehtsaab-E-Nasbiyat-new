/**
 * Archive.org Helper utilities for auto-fetching and URL parsing
 */

export interface ArchiveMetadata {
  identifier: string;
  title?: string;
  description?: string;
  coverImage: string;
  pdfUrl: string;
  detailsUrl: string;
  itemSize?: string;
}

/**
 * Extracts Archive.org identifier from various URL formats or plain ID
 * e.g.:
 * https://archive.org/details/ihtisab-nasbiyat-vol1
 * https://archive.org/download/ihtisab-nasbiyat-vol1/ihtisab-nasbiyat-vol1.pdf
 * https://archive.org/stream/ihtisab-nasbiyat-vol1
 * ihtisab-nasbiyat-vol1
 */
export function extractArchiveId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  // If user pasted a full URL
  const matchDetails = trimmed.match(/archive\.org\/details\/([a-zA-Z0-9_-]+)/i);
  if (matchDetails && matchDetails[1]) return matchDetails[1];

  const matchDownload = trimmed.match(/archive\.org\/download\/([a-zA-Z0-9_-]+)/i);
  if (matchDownload && matchDownload[1]) return matchDownload[1];

  const matchStream = trimmed.match(/archive\.org\/stream\/([a-zA-Z0-9_-]+)/i);
  if (matchStream && matchStream[1]) return matchStream[1];

  const matchServices = trimmed.match(/archive\.org\/services\/img\/([a-zA-Z0-9_-]+)/i);
  if (matchServices && matchServices[1]) return matchServices[1];

  // If it's a bare identifier without spaces
  if (!trimmed.includes('/') && !trimmed.includes(' ')) {
    return trimmed;
  }

  // Fallback: extract last path segment before query/file
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && ['details', 'download', 'stream'].includes(parts[0])) {
      return parts[1];
    }
    return parts[parts.length - 1].replace(/\.[^/.]+$/, '');
  } catch {
    return trimmed.replace(/^https?:\/\//i, '').split('/')[0];
  }
}

/**
 * Generate standard Archive.org URLs based on identifier
 */
export function getArchiveUrls(identifier: string) {
  const cleanId = extractArchiveId(identifier);
  return {
    identifier: cleanId,
    coverImage: cleanId ? `https://archive.org/services/img/${cleanId}` : '',
    detailsUrl: cleanId ? `https://archive.org/details/${cleanId}` : '',
    pdfUrl: cleanId ? `https://archive.org/download/${cleanId}/${cleanId}.pdf` : '',
    readerUrl: cleanId ? `https://archive.org/details/${cleanId}?view=theater` : '',
  };
}

/**
 * Auto-fetch metadata from Archive.org API
 */
export async function fetchArchiveItemInfo(urlOrId: string): Promise<ArchiveMetadata> {
  const identifier = extractArchiveId(urlOrId);
  const baseUrls = getArchiveUrls(identifier);

  if (!identifier) {
    throw new Error('درست آرکائیو لنک یا آئی ڈی درج کریں');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`https://archive.org/metadata/${identifier}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const meta = data.metadata || {};
      const files: Array<{ name: string; format?: string; size?: string }> = data.files || [];

      // Find the primary PDF file
      const pdfFile = files.find(
        (f) => f.name.toLowerCase().endsWith('.pdf') || (f.format && f.format.toLowerCase().includes('text pdf'))
      );

      let finalPdfUrl = baseUrls.pdfUrl;
      let calculatedSize = '';

      if (pdfFile) {
        finalPdfUrl = `https://archive.org/download/${identifier}/${encodeURIComponent(pdfFile.name)}`;
        if (pdfFile.size) {
          const mb = (parseInt(pdfFile.size, 10) / (1024 * 1024)).toFixed(1);
          calculatedSize = `${mb} MB`;
        }
      }

      return {
        identifier,
        title: meta.title || '',
        description: meta.description || '',
        coverImage: baseUrls.coverImage,
        pdfUrl: finalPdfUrl,
        detailsUrl: baseUrls.detailsUrl,
        itemSize: calculatedSize,
      };
    }
  } catch {
    // If CORS or offline, fallback cleanly to direct canonical URLs
  }

  // Graceful fallback
  return {
    identifier,
    coverImage: baseUrls.coverImage,
    pdfUrl: baseUrls.pdfUrl,
    detailsUrl: baseUrls.detailsUrl,
  };
}
