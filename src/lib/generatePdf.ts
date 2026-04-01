import jsPDF from 'jspdf';
import { MONTHS_LIST, type TourFormData } from './formData';

export function generatePDF(obj: TourFormData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210, ML = 18, MR = 192, FW = MR - ML;
  const NAVY: [number,number,number]  = [28,  59, 110];
  const BLUE: [number,number,number]  = [44, 111, 173];
  const GOLD: [number,number,number]  = [201, 150, 58];
  const LGRAY: [number,number,number] = [244, 246, 249];
  const WHITE: [number,number,number] = [255, 255, 255];
  const DGRAY: [number,number,number] = [80,  80,  80];
  const BLACK: [number,number,number] = [30,  30,  30];

  let y = 0;

  // Header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 38, 'F');
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.7);
  doc.line(ML, 33, MR, 33);
  doc.setLineWidth(0.3);
  doc.line(ML, 35, MR, 35);

  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Organisation of the 2026 Tours', W / 2, 14, { align: 'center' });
  doc.setFontSize(14);
  doc.text('of H.E. Jamgon Kongtrul Rinpoche', W / 2, 24, { align: 'center' });

  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('Request form submitted on ' + new Date().toLocaleDateString('en-GB'), W / 2, 31, { align: 'center' });

  y = 46;

  function section(title: string) {
    doc.setFillColor(...BLUE);
    doc.rect(ML, y, FW, 8, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(title.toUpperCase(), ML + 4, y + 5.5);
    y += 13;
  }

  function row(label: string, value?: string, indent = 0) {
    doc.setFillColor(...LGRAY);
    doc.rect(ML + indent, y, 52 - indent, 7.5, 'F');
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.2);
    doc.rect(ML + indent, y, FW - indent, 7.5, 'S');

    doc.setTextColor(...DGRAY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(label, ML + indent + 3, y + 5);

    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(value || '—', ML + indent + 56, y + 5);
    y += 9;
  }

  function rowMulti(label: string, value?: string) {
    const lines = doc.splitTextToSize(value || '—', FW - 60);
    const h = Math.max(10, lines.length * 5.5 + 4);

    doc.setFillColor(...LGRAY);
    doc.rect(ML, y, 52, h, 'F');
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.2);
    doc.rect(ML, y, FW, h, 'S');

    doc.setTextColor(...DGRAY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(label, ML + 3, y + 5);

    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(lines, ML + 56, y + 5);
    y += h + 1.5;
  }

  function separator() {
    y += 3;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(ML, y, MR, y);
    y += 6;
  }

  // Section 1
  section('Center Information');
  row('Name of center', obj.center_name);
  row('City', obj.city);
  row('Country', obj.country);
  separator();

  // Section 2
  section('Person Responsible 1');
  row('First name', obj.p1_firstname);
  row('Last name', obj.p1_lastname);
  row('Phone', (obj.p1_code || '') + ' ' + (obj.p1_phone || ''));
  row('Email', obj.p1_email);
  separator();

  // Section 3
  section('Person Responsible 2');
  const hasP2 = obj.p2_firstname || obj.p2_lastname;
  if (hasP2) {
    row('First name', obj.p2_firstname);
    row('Last name', obj.p2_lastname);
    row('Phone', (obj.p2_code || '') + ' ' + (obj.p2_phone || ''));
    row('Email', obj.p2_email);
  } else {
    doc.setTextColor(...DGRAY);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Not specified', ML + 4, y + 4);
    y += 9;
  }
  separator();

  // Helper to format a date
  function fmtDate(day: string, month: string) {
    return day && month ? day + ' / ' + MONTHS_LIST[parseInt(month) - 1] + ' 2026' : '—';
  }

  // Section 4 — Plan A
  section('section('Plan A — H.H. Karmapa comes to the European Center');');
  row('Option 1 — Start', fmtDate(obj.start_day, obj.start_month));
  row('Option 1 — End', fmtDate(obj.end_day, obj.end_month));

  const hasAltA = obj.start_day_alt || obj.start_month_alt || obj.end_day_alt || obj.end_month_alt;
  if (hasAltA) {
    y += 2;
    row('Option 2 — Start', fmtDate(obj.start_day_alt, obj.start_month_alt), 4);
    row('Option 2 — End', fmtDate(obj.end_day_alt, obj.end_month_alt), 4);
  }
  separator();

  // Section 5 — Plan B
  section('Plan B — H.E. Karmapa does not come to the European Center');
  const hasB = obj.start_day2 || obj.start_month2 || obj.end_day2 || obj.end_month2;
  if (hasB) {
    row('Option 1 — Start', fmtDate(obj.start_day2, obj.start_month2));
    row('Option 1 — End', fmtDate(obj.end_day2, obj.end_month2));

    const hasAltB = obj.start_day2_alt || obj.start_month2_alt || obj.end_day2_alt || obj.end_month2_alt;
    if (hasAltB) {
      y += 2;
      row('Option 2 — Start', fmtDate(obj.start_day2_alt, obj.start_month2_alt), 4);
      row('Option 2 — End', fmtDate(obj.end_day2_alt, obj.end_month2_alt), 4);
    }
  } else {
    doc.setTextColor(...DGRAY);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Not specified', ML + 4, y + 4);
    y += 9;
  }

  y += 2;
  rowMulti('Topic(s)', obj.topics);
  rowMulti('Empowerment(s)', obj.empowerments);
  rowMulti('Additional notes', obj.comments);

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...NAVY);
  doc.rect(0, pageH - 14, W, 14, 'F');
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(0, pageH - 14, W, pageH - 14);
  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('tour2026@jamgon-kongtrul.org', W / 2, pageH - 6, { align: 'center' });

  return doc;
}

export function downloadPDF(data: TourFormData) {
  const doc = generatePDF(data);
  const fileName = 'Tour2026_' + (data.center_name || 'request').replace(/\s+/g, '_') + '.pdf';
  doc.save(fileName);
  return fileName;
}

export function openMailto(data: TourFormData, ccEmail?: string) {
  const subject = encodeURIComponent('Tour 2026 — Request from ' + data.center_name + ', ' + data.country);
  const body = encodeURIComponent(
    'Please find attached the completed request form for the 2026 tour.\n\n' +
    'Center: ' + data.center_name + '\n' +
    'City: ' + data.city + ', ' + data.country + '\n' +
    'Contact: ' + data.p1_firstname + ' ' + data.p1_lastname + ' — ' + data.p1_email + '\n' +
    'Period: ' + (data.start_day || '?') + '/' + (data.start_month || '?') + '/2026' +
    ' to ' + (data.end_day || '?') + '/' + (data.end_month || '?') + '/2026 \n\n' +
    '(PDF attached)'
  );
  const cc = ccEmail ? '&cc=' + encodeURIComponent(ccEmail) : '';
  window.location.href = 'mailto:tour2026@jamgon-kongtrul.org?subject=' + subject + cc + '&body=' + body;
}
