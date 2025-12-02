import { recognize } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ExtractedReceiptData {
  merchantName?: string;
  amount?: number;
  tax?: number;
  total?: number;
  date?: Date;
  rawText: string;
}

/**
 * Convert the first page of a PDF to an image data URL
 */
async function pdfToImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  // Render at 2x scale for better OCR accuracy
  const scale = 2;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  } as any).promise;

  return canvas.toDataURL('image/png');
}

/**
 * Extract receipt data from an image or PDF file using OCR
 */
export async function extractReceiptData(file: File): Promise<ExtractedReceiptData> {
  try {
    console.log('Starting OCR for file:', file.name, 'Type:', file.type);

    let imageUrl: string;

    // For PDFs, convert first page to image
    if (file.type === 'application/pdf') {
      console.log('Converting PDF to image for OCR...');
      imageUrl = await pdfToImage(file);
    } else {
      // Convert image file to data URL
      imageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    console.log('Running Tesseract OCR...');
    const result = await recognize(imageUrl, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const text = result.data.text;
    console.log('OCR Result:', text ? text.substring(0, 200) + '...' : 'No text extracted');

    if (!text || text.trim().length === 0) {
      console.warn('OCR returned empty text');
      return { rawText: '' };
    }

    const extractedData = {
      merchantName: extractMerchantName(text),
      amount: extractSubtotal(text),
      tax: extractTax(text),
      total: extractTotal(text),
      date: extractDate(text),
      rawText: text,
    };

    console.log('Extracted data:', {
      merchantName: extractedData.merchantName,
      amount: extractedData.amount,
      tax: extractedData.tax,
      total: extractedData.total,
      date: extractedData.date?.toISOString(),
    });

    return extractedData;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    // Return empty result on failure
    return {
      rawText: '',
    };
  }
}

/**
 * Extract the subtotal (amount before tax) from receipt text
 */
function extractSubtotal(text: string): number | undefined {
  const normalizedText = text.toLowerCase();

  // Patterns to match subtotal
  const patterns = [
    /(?:subtotal|sub\s*total|sub-total)[\s:]*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(?:amount|items?\s*total)[\s:]*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  return undefined;
}

/**
 * Extract tax amount from receipt text
 */
function extractTax(text: string): number | undefined {
  // Split into lines for line-by-line analysis
  const lines = text.split('\n');

  // Patterns that indicate "excluding tax" - skip these lines
  const excludingTaxPatterns = [
    /excl(?:uding)?\s*(?:of\s*)?tax/i,
    /before\s*tax/i,
    /ex(?:cl)?\.?\s*tax/i,
    /without\s*tax/i,
    /pre[- ]?tax/i,
  ];

  // Patterns to match actual tax amounts
  const taxPatterns = [
    // "Tax - South Carolina (6% on $100.00) $6.00" - tax amount at end of line
    /tax\s*[-–—]\s*[^$]*\$[\d.,]+\)?[\s]*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    // "Tax - State Name $6.00" or "Tax - 6% $6.00"
    /tax\s*[-–—]\s*[^$]*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*$/i,
    // Standard tax patterns
    /(?:sales\s*tax|hst|gst|pst|vat)[\s:]*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(?:tax\s*amount|tax\s*total|total\s*tax)[\s:]*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /^(?:tax)[\s:]*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /[\s:]tax[\s:]*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
  ];

  // Search line by line, skipping "excluding tax" lines
  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Skip lines that indicate "excluding tax"
    const isExcludingTax = excludingTaxPatterns.some(pattern => pattern.test(lowerLine));
    if (isExcludingTax) {
      continue;
    }

    // Try to match tax patterns on this line
    for (const pattern of taxPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount >= 0) {
          return amount;
        }
      }
    }
  }

  return undefined;
}

/**
 * Extract the total amount from receipt text
 */
function extractTotal(text: string): number | undefined {
  const normalizedText = text.toLowerCase();

  // Patterns to match total, prioritizing "total" related lines
  const patterns = [
    // Total patterns (most reliable)
    /(?:grand\s*total|total\s*due|amount\s*due|balance\s*due)[\s:]*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(?:total)[\s:]*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    // Currency symbol patterns
    /\$\s?(\d{1,3}(?:,\d{3})*\.\d{2})/,
    // Amount with USD/CAD/EUR suffix
    /(\d{1,3}(?:,\d{3})*\.\d{2})\s?(?:USD|CAD|EUR)/i,
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  // Fallback: find the largest dollar amount (likely the total)
  const allAmounts = text.match(/\$?\d{1,3}(?:,\d{3})*\.\d{2}/g);
  if (allAmounts && allAmounts.length > 0) {
    const amounts = allAmounts
      .map(a => parseFloat(a.replace(/[$,]/g, '')))
      .filter(a => !isNaN(a) && a > 0);

    if (amounts.length > 0) {
      return Math.max(...amounts);
    }
  }

  return undefined;
}

/**
 * Extract date from receipt text
 */
function extractDate(text: string): Date | undefined {
  // Common date patterns
  const patterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // MM/DD/YY or MM-DD-YY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})(?!\d)/,
    // Month DD, YYYY (e.g., "January 15, 2024")
    /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i,
    // DD Month YYYY (e.g., "15 January 2024")
    /(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?),?\s+(\d{4})/i,
    // YYYY-MM-DD (ISO format)
    /(\d{4})-(\d{2})-(\d{2})/,
  ];

  const monthMap: { [key: string]: number } = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let year: number;
        let month: number;
        let day: number;

        // Handle different pattern formats
        if (pattern.source.includes('Jan')) {
          // Month name patterns
          if (pattern.source.startsWith('(\\d')) {
            // DD Month YYYY format
            day = parseInt(match[1], 10);
            month = monthMap[match[2].toLowerCase().substring(0, 3)];
            year = parseInt(match[3], 10);
          } else {
            // Month DD, YYYY format
            month = monthMap[match[1].toLowerCase().substring(0, 3)];
            day = parseInt(match[2], 10);
            year = parseInt(match[3], 10);
          }
        } else if (pattern.source.startsWith('(\\d{4})')) {
          // YYYY-MM-DD format
          year = parseInt(match[1], 10);
          month = parseInt(match[2], 10) - 1;
          day = parseInt(match[3], 10);
        } else {
          // MM/DD/YYYY or MM/DD/YY format
          month = parseInt(match[1], 10) - 1;
          day = parseInt(match[2], 10);
          year = parseInt(match[3], 10);

          // Handle 2-digit years
          if (year < 100) {
            year += year > 50 ? 1900 : 2000;
          }
        }

        const date = new Date(year, month, day);

        // Validate the date
        if (!isNaN(date.getTime()) && date.getFullYear() > 1990 && date.getFullYear() <= new Date().getFullYear() + 1) {
          return date;
        }
      } catch {
        continue;
      }
    }
  }

  return undefined;
}

/**
 * Extract merchant name from receipt text
 */
function extractMerchantName(text: string): string | undefined {
  // Split into lines and filter empty ones
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return undefined;
  }

  // Common patterns to skip (not merchant names)
  const skipPatterns = [
    /^(receipt|invoice|order|transaction|date|time|store|location|tel|phone|fax|www\.|http)/i,
    /^\d+$/, // Just numbers
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/, // Just a date
    /^\d{1,2}:\d{2}/, // Just a time
    /^#\d+/, // Order numbers
  ];

  // Look at first few lines for merchant name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];

    // Skip if matches skip patterns
    if (skipPatterns.some(pattern => pattern.test(line))) {
      continue;
    }

    // Skip very short lines or very long lines
    if (line.length < 3 || line.length > 50) {
      continue;
    }

    // Skip lines that are mostly numbers/special chars
    const alphaCount = (line.match(/[a-zA-Z]/g) || []).length;
    if (alphaCount < line.length * 0.3) {
      continue;
    }

    // This looks like a merchant name
    // Clean up common suffixes
    let merchantName = line
      .replace(/\s+(inc\.?|llc\.?|ltd\.?|corp\.?)$/i, '')
      .replace(/\s*[-#]\s*\d+$/, '') // Remove trailing store numbers
      .trim();

    if (merchantName.length >= 2) {
      return merchantName;
    }
  }

  // Fallback: just return the first non-empty line
  return lines[0]?.substring(0, 50);
}
