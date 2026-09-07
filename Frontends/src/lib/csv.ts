/** Minimal CSV export helper - escaping + a real browser download, no library needed. */

function escapeCsvValue(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  // Leading BOM so Excel (common in Indonesian back-office use) opens UTF-8
  // Indonesian text (e.g. "Rp", accented names) correctly instead of mojibake.
  const bom = '﻿';
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(','));
  const csvContent = bom + lines.join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
