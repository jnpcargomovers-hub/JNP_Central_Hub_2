/* ============================================================================
 *  JNP BUILTY (LR) PDF — shared by the Loader screen and the Builty reprint screen
 *  Needs jsPDF loaded first:
 *  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
 * ========================================================================== */
(function (w) {
  'use strict';
  let logoData = null;

  async function loadLogo() {
    if (logoData !== null) return logoData;
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image(); i.crossOrigin = 'anonymous';
        i.onload = () => res(i); i.onerror = rej; i.src = JNP.CONFIG.LOGO;
      });
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0);
      logoData = { url: c.toDataURL('image/jpeg', 0.92), r: img.naturalWidth / img.naturalHeight };
    } catch (e) { logoData = false; }
    return logoData;
  }

  function fmtDate(v) {
    if (!v) return '';
    const s = String(v).slice(0, 10).split('-');
    return s.length === 3 ? s[2] + '-' + s[1] + '-' + s[0] : String(v);
  }
  function gradeLabel(g) {
    g = String(g || '').toUpperCase();
    if (!g) return '';
    if (/^O\d/.test(g) || g.indexOf('OPC') === 0) return 'OPC (' + g + ')';
    if (g.indexOf('PPC') === 0) return 'PPC (' + g + ')';
    return g;
  }

  // Used only when a value is missing in DB_Master › Settings (copied from the printed JNP builty)
  const DEFAULTS = {
    Company_Name: 'J N P Cargo Movers Pvt Ltd',
    Company_Address: 'Flat No. 202, Satyam Apartment, Canal Road, Gokulpeth, Nagpur – 440010',
    Company_GSTIN: '27AAECJ9546P1ZP', Company_PAN: 'AAECJ9546P', Transport_Code: '2309435',
    Plant_Loading_Mobile: '8180086299', Vehicle_Maintenance_Mobile: '7385944891',
    Consignor_Name: 'UltraTech Cement Limited',
    Consignor_Address: 'Unit – Dhule Cement Works, PO: Dhule, Tehsil: Sindkhede, Dist: Dhule, State: Maharashtra, State Code: 27',
    Consignor_GSTIN: '27AAACL6442L1ZA', Consignor_PAN: 'AAACL6442L',
    Builty_Terms: '3 (three) point delivery within 15 kms radius allowed',
  };

  /** r = Loader record (from save or lookupLR). st = masters.settings. Returns a PDF Blob. */
  async function make(r, st) {
    const s0 = st || {}; st = {};
    Object.keys(DEFAULTS).concat(Object.keys(s0)).forEach(k => { const v = s0[k]; st[k] = v !== undefined && v !== null && String(v).trim() !== '' ? String(v).trim() : (DEFAULTS[k] || ''); });
    const { jsPDF } = w.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });
    const W = 148, M = 7, IW = W - 2 * M;
    const NAVY = [11, 42, 91], GREY = [95, 104, 120], LINE = [120, 130, 145];
    doc.setLineWidth(0.25); doc.setDrawColor.apply(doc, LINE);

    // ---- header
    const logo = await loadLogo();
    let y = M;
    if (logo) { const h = 13; doc.addImage(logo.url, 'JPEG', M, y, h * logo.r > 34 ? 34 : h * logo.r, h * logo.r > 34 ? 34 / logo.r : h); }
    doc.setTextColor.apply(doc, NAVY); doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
    doc.text(String(st.Company_Name || 'JNP Cargo Movers Pvt Ltd').toUpperCase(), W / 2 + 10, y + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(40);
    doc.text('FLEET OWNERS & TRANSPORTER', W / 2 + 10, y + 9, { align: 'center' });
    doc.setFontSize(6.8);
    doc.text(String(st.Company_Address || ''), W / 2 + 10, y + 12.5, { align: 'center', maxWidth: IW - 36 });
    y += 17;
    doc.text([st.Company_GSTIN ? 'GSTIN: ' + st.Company_GSTIN : '', st.Company_PAN ? 'PAN: ' + st.Company_PAN : ''].filter(Boolean).join('    '), M, y);
    doc.text([st.Plant_Loading_Mobile ? 'Plant Loading: ' + st.Plant_Loading_Mobile : '', st.Vehicle_Maintenance_Mobile ? 'Vehicle Maintenance: ' + st.Vehicle_Maintenance_Mobile : ''].filter(Boolean).join('    '), W - M, y, { align: 'right' });
    y += 2;
    doc.setDrawColor.apply(doc, NAVY); doc.setLineWidth(0.6); doc.line(M, y, W - M, y);
    doc.setLineWidth(0.25); doc.setDrawColor.apply(doc, LINE);
    y += 1.5;

    // ---- title band
    doc.setFillColor.apply(doc, NAVY); doc.rect(M, y, IW, 7, 'F');
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text('LORRY RECEIPT / BUILTY', M + 3, y + 4.8);
    doc.setFontSize(9); doc.text('Dedicated', W - M - 3, y + 4.8, { align: 'right' });
    y += 7;

    // ---- box helper
    const box = (x, yy, wd, ht, label, value, o) => {
      o = o || {};
      doc.rect(x, yy, wd, ht);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.3); doc.setTextColor.apply(doc, GREY);
      const lab = doc.splitTextToSize(String(label).toUpperCase(), wd - 3.2);
      doc.text(lab.slice(0, 2), x + 1.6, yy + 3);
      doc.setTextColor(15); doc.setFont('helvetica', o.bold === false ? 'normal' : 'bold'); doc.setFontSize(o.size || 9.5);
      const lines = doc.splitTextToSize(String(value === undefined || value === null ? '' : value), wd - 3.2);
      doc.text(lines.slice(0, o.maxLines || 3), x + 1.6, yy + 3 + (o.size || 9.5) * 0.42 + 0.6);
    };

    // row: transport code | date | LR no
    const c3 = IW / 3;
    box(M, y, c3, 10, 'Transport Code', st.Transport_Code || '');
    box(M + c3, y, c3, 10, 'Date', fmtDate(r.Trip_Date || r.Created_At));
    doc.setFillColor(238, 243, 250); doc.rect(M + 2 * c3, y, c3, 10, 'F');
    box(M + 2 * c3, y, c3, 10, 'LR No.', r.LR_No, { size: 13 });
    y += 10;

    // consignor | invoice + DI + consignee
    const half = IW / 2;
    box(M, y, half, 27, 'Consignor', [st.Consignor_Name ? String(st.Consignor_Name).toUpperCase() : '', st.Consignor_Address, [st.Consignor_GSTIN ? 'GSTIN: ' + st.Consignor_GSTIN : '', st.Consignor_PAN ? 'PAN: ' + st.Consignor_PAN : ''].filter(Boolean).join('  ')].filter(Boolean).join('\n'), { size: 7.6, bold: false, maxLines: 7 });
    box(M + half, y, half, 9, 'Invoice No.', r.Invoice_No || '');
    box(M + half, y + 9, half, 9, 'DI No.', r.DI_No || '');
    box(M + half, y + 18, half, 9, 'Consignee', r.Consignee || '', { size: 8.5, maxLines: 2 });
    y += 27;

    // vehicle | destination
    box(M, y, half, 10, 'Vehicle No.', r.Truck_No, { size: 12 });
    box(M + half, y, half, 10, 'Destination', r.Destination || '', { size: 10 });
    y += 10;

    // qty | bags | grade
    box(M, y, c3, 10, 'Qty (MT)', r.Qty_MT !== '' && r.Qty_MT !== undefined ? Number(r.Qty_MT).toFixed(3) : '', { size: 12 });
    box(M + c3, y, c3, 10, 'No. of Bags', r.Bags === 'Loose' ? 'Loose (Bulk)' : (r.Bags || ''));
    box(M + 2 * c3, y, c3, 10, 'Grade / Type of Pkg', gradeLabel(r.Grade) + (r.Load_Type ? ' · ' + (r.Load_Type === 'BULK' ? 'Bulk' : 'Bag') : ''), { size: 8.5 });
    y += 10;

    // freight | driver | mobile
    box(M, y, c3, 10, 'Freight Type', r.Freight_Type || 'To Be Billed (TBB)', { size: 8.5 });
    box(M + c3, y, c3, 10, "Driver's Name", r.Driver_Name || '', { size: 8.5, maxLines: 2 });
    box(M + 2 * c3, y, c3, 10, "Driver's Mobile No.", r.Driver_Mobile || '');
    y += 10;

    // terms
    doc.rect(M, y, IW, 7);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.6); doc.setTextColor(30);
    doc.text(String(st.Builty_Terms || '3 (three) point delivery within 15 km radius allowed').toUpperCase(), W / 2, y + 4.6, { align: 'center' });
    y += 7;

    // signatures
    const sh = 30;
    box(M, y, c3, sh, "Driver's declaration at packing plant", '', {});
    box(M + c3, y, c3, sh, 'Received material in good condition', '', {});
    box(M + 2 * c3, y, c3, sh, 'For ' + (st.Company_Name || 'JNP Cargo Movers Pvt Ltd'), '', {});
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor.apply(doc, GREY);
    doc.text('Driver signature', M + c3 / 2, y + sh - 2.5, { align: 'center' });
    doc.text("Receiver's signature, date & stamp", M + c3 * 1.5, y + sh - 2.5, { align: 'center' });
    doc.text('Authorised signatory', M + c3 * 2.5, y + sh - 2.5, { align: 'center' });
    y += sh;

    // footer
    doc.setFontSize(6.2); doc.setTextColor.apply(doc, GREY);
    const by = r.Created_By ? 'Entered by ' + r.Created_By + (r.Created_At ? ' at ' + r.Created_At : '') + ' · ' : '';
    doc.text('System-generated LR · ' + by + 'Ref ' + (r.Record_ID || ''), M, y + 4, { maxWidth: IW });
    if (r.Start_KM) doc.text('Start KM ' + r.Start_KM + (r.Diesel_Ltr !== '' && r.Diesel_Ltr !== undefined ? ' · Diesel ' + r.Diesel_Ltr + ' L' : ''), M, y + 7.5);

    return doc.output('blob');
  }

  async function share(r, st) {
    const blob = await make(r, st);
    const name = 'Builty_' + r.LR_No + '_' + r.Truck_No + '.pdf';
    const text = 'Builty ' + r.LR_No + ' | ' + r.Truck_No + ' | ' + (r.Destination || '') + ' | ' + (r.Qty_MT || '') + ' MT';
    return JNP.shareFile(blob, name, text);
  }

  w.JNPBuilty = { make, share, gradeLabel };
})(window);
