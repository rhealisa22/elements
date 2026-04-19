interface ParsedEmail {
  subject: string;
  htmlBody: string | null;
  textBody: string | null;
}

function decodeQuotedPrintable(input: string): string {
  return input
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function decodeBase64(input: string): string {
  try {
    return atob(input.replace(/\s/g, ''));
  } catch {
    return input;
  }
}

function decodeBody(body: string, encoding: string): string {
  const enc = encoding.toLowerCase().trim();
  if (enc === 'base64') return decodeBase64(body);
  if (enc === 'quoted-printable') return decodeQuotedPrintable(body);
  return body;
}

function parseHeaders(headerBlock: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const unfolded = headerBlock.replace(/\r?\n(?=[ \t])/g, ' ');
  for (const line of unfolded.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.substring(0, idx).trim().toLowerCase();
      const value = line.substring(idx + 1).trim();
      headers[key] = value;
    }
  }
  return headers;
}

function extractBoundary(contentType: string): string | null {
  const match = contentType.match(/boundary="?([^";\s]+)"?/i);
  return match ? match[1] : null;
}

function parseMultipart(body: string, boundary: string): { html: string | null; text: string | null } {
  const parts = body.split(`--${boundary}`);
  let html: string | null = null;
  let text: string | null = null;

  for (const part of parts) {
    if (part.trim() === '' || part.trim() === '--') continue;

    const blankIdx = part.search(/\r?\n\r?\n/);
    if (blankIdx === -1) continue;

    const partHeaders = parseHeaders(part.substring(0, blankIdx));
    const partBody = part.substring(blankIdx).replace(/^\r?\n\r?\n/, '');
    const ct = partHeaders['content-type'] || '';
    const cte = partHeaders['content-transfer-encoding'] || '7bit';

    if (ct.includes('multipart/')) {
      const nestedBoundary = extractBoundary(ct);
      if (nestedBoundary) {
        const nested = parseMultipart(partBody, nestedBoundary);
        if (nested.html && !html) html = nested.html;
        if (nested.text && !text) text = nested.text;
      }
    } else if (ct.includes('text/html') && !html) {
      html = decodeBody(partBody, cte);
    } else if ((ct.includes('text/plain') || !ct) && !text) {
      text = decodeBody(partBody, cte);
    }
  }

  return { html, text };
}

export function parseEml(raw: string): ParsedEmail {
  const blankLineIdx = raw.search(/\r?\n\r?\n/);
  const headerBlock = blankLineIdx > 0 ? raw.substring(0, blankLineIdx) : raw;
  const body = blankLineIdx > 0 ? raw.substring(blankLineIdx).replace(/^\r?\n\r?\n/, '') : '';

  const headers = parseHeaders(headerBlock);
  const subject = headers['subject'] || '(No subject)';
  const contentType = headers['content-type'] || 'text/plain';
  const encoding = headers['content-transfer-encoding'] || '7bit';

  const boundary = extractBoundary(contentType);

  if (boundary) {
    const { html, text } = parseMultipart(body, boundary);
    return { subject, htmlBody: html, textBody: text };
  }

  const decoded = decodeBody(body, encoding);

  if (contentType.includes('text/html')) {
    return { subject, htmlBody: decoded, textBody: null };
  }

  return { subject, htmlBody: null, textBody: decoded };
}
