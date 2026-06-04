// src/utils/exportScreeningPDF.js

function typeLabel(type = '') {
  const map = {
    FRONT:  'Tampak Depan',
    BACK:   'Tampak Belakang',
    SIDE:   'Tampak Samping',
    SIDE_L: 'Tampak Samping Kiri',
    SIDE_R: 'Tampak Samping Kanan',
    LEFT:   'Tampak Kiri',
    RIGHT:  'Tampak Kanan',
  };
  return map[type?.toUpperCase()] || type || '-';
}

function cropLabel(type = '') {
  const region = type.replace(/^CROP_/i, '').toUpperCase();
  const map = {
    SHOULDER: 'Area Bahu',
    HIP:      'Area Panggul',
    HEAD:     'Area Kepala',
    NECK:     'Area Leher',
    TORSO:    'Area Punggung',
  };
  return map[region] || region;
}

// Menghasilkan string HTML lengkap dengan CSS inline
export function generateScreeningHTML(data) {
  `@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  @page { margin: 1.5cm; size: A4; }
  }`
  if (!data) return '';

  const {
    child,
    score,
    category,
    summary,
    created_at,
    metrics,
    images = [],
    manualRecommendations = [],
    referral_status,
    physiotherapist,
  } = data;

  const statusMap = {
    none:      'Belum ada konsultasi',
    requested: 'Menunggu konfirmasi fisioterapis',
    accepted:  'Sedang dalam penanganan',
    completed: 'Selesai konsultasi',
    cancelled: 'Dibatalkan',
  };

  const mainImages = images.filter((img) => !img.type?.startsWith('CROP_'));
  const cropImages = images.filter((img) =>  img.type?.startsWith('CROP_'));

  const catConfig = {
    GOOD:      { label: 'Postur Baik',      color: '#16a34a' },
    FAIR:      { label: 'Perlu Dipantau',   color: '#d97706' },
    ATTENTION: { label: 'Perlu Perhatian',  color: '#dc2626' },
  };

  const cat = catConfig[category] || { label: '-', color: '#6b7280' };
  const themeColor = cat.color;
  const m = metrics || {};

  const metricRows = [
    m.shoulder_tilt_index !== undefined && `
      <tr>
        <td>${m.shoulder_tilt_index < 2 ? '' : '⚠️ '}Kemiringan Bahu</td>
        <td>${Number(m.shoulder_tilt_index).toFixed(2)}%</td>
        <td style="color:${m.shoulder_tilt_index < 2 ? '#16a34a' : '#dc2626'};font-weight:600">${m.shoulder_tilt_index < 2 ? 'Normal' : 'Deviasi'}</td>
      </tr>`,
    m.hip_tilt_index !== undefined && `
      <tr>
        <td>${m.hip_tilt_index < 2 ? '' : '⚠️ '}Kemiringan Panggul</td>
        <td>${Number(m.hip_tilt_index).toFixed(2)}%</td>
        <td style="color:${m.hip_tilt_index < 2 ? '#16a34a' : '#dc2626'};font-weight:600">${m.hip_tilt_index < 2 ? 'Normal' : 'Deviasi'}</td>
      </tr>`,
    m.forward_head_index !== undefined && `
      <tr>
        <td>${m.forward_head_index < 0.2 ? '' : '⚠️ '}Forward Head Posture</td>
        <td>${Number(m.forward_head_index).toFixed(2)}</td>
        <td style="color:${m.forward_head_index < 0.2 ? '#16a34a' : '#dc2626'};font-weight:600">${m.forward_head_index < 0.2 ? 'Normal' : 'Terdeteksi'}</td>
      </tr>`,
    m.neck_inclination_deg !== undefined && `
      <tr>
        <td>${m.neck_inclination_deg < 15 ? '' : '⚠️ '}Kemiringan Leher</td>
        <td>${Number(m.neck_inclination_deg).toFixed(1)}°</td>
        <td style="color:${m.neck_inclination_deg < 15 ? '#16a34a' : '#dc2626'};font-weight:600">${m.neck_inclination_deg < 15 ? 'Normal' : 'Deviasi'}</td>
      </tr>`,
    m.torso_inclination_deg !== undefined && `
      <tr>
        <td>${m.torso_inclination_deg < 15 ? '' : '⚠️ '}Kemiringan Punggung</td>
        <td>${Number(m.torso_inclination_deg).toFixed(1)}°</td>
        <td style="color:${m.torso_inclination_deg < 15 ? '#16a34a' : '#dc2626'};font-weight:600">${m.torso_inclination_deg < 15 ? 'Normal' : 'Deviasi'}</td>
      </tr>`,
  ].filter(Boolean).join('');

  const findingsRows = Array.isArray(m.findings) && m.findings.length > 0
    ? m.findings.map((f) => `
        <tr>
          <td>${f.area || '-'}</td>
          <td>${f.detail || '-'}</td>
          <td style="color:${f.severity === 'Ringan' ? '#16a34a' : '#d97706'};font-weight:600">${f.severity || '-'}</td>
        </tr>`).join('')
    : '';

  const aiRecs = mainImages.flatMap((img) =>
    (img.recommendations || []).map((r) => ({ ...r, view: typeLabel(img.type) }))
  );

  const mainPhotosHtml = mainImages.length > 0
    ? mainImages.map((img) => {
        const src = img.url_processed || img.url_original;
        return `
          <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;background:#f9fafb;break-inside:avoid">
            <div style="width:100%;height:210px;overflow:hidden;background:#f3f4f6;display:flex;align-items:center;justify-content:center">
              <img src="${src}" alt="${typeLabel(img.type)}"
                style="width:100%;height:100%;object-fit:cover;display:block"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
              <div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:11px;color:#9ca3af;text-align:center;padding:10px">Foto tidak dapat dimuat</div>
            </div>
            <div style="padding:6px 10px;font-size:11px;font-weight:600;color:#374151;text-align:center;background:#f3f4f6">${typeLabel(img.type)}</div>
            ${img.url_processed
              ? `<div style="text-align:center;font-size:9px;font-weight:700;color:#2563eb;background:#eff6ff;padding:3px 6px">Hasil Analisis AI</div>`
              : `<div style="text-align:center;font-size:9px;font-weight:700;color:#6b7280;background:#f3f4f6;padding:3px 6px">Foto Original</div>`}
          </div>`;
      }).join('')
    : '<p style="color:#9ca3af;font-size:12px">Tidak ada foto screening.</p>';

  const cropPhotosHtml = cropImages.length > 0
    ? cropImages.map((img) => {
        const src = img.url_original || img.url_processed;
        return `
          <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;background:#f9fafb;break-inside:avoid">
            <div style="width:100%;height:150px;overflow:hidden;background:#f3f4f6;display:flex;align-items:center;justify-content:center">
              <img src="${src}" alt="${cropLabel(img.type)}"
                style="width:100%;height:100%;object-fit:cover;display:block"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
              <div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:11px;color:#9ca3af;text-align:center;padding:10px">Foto tidak dapat dimuat</div>
            </div>
            <div style="padding:6px 10px;font-size:11px;font-weight:600;color:#374151;text-align:center;background:#f3f4f6">${cropLabel(img.type)}</div>
          </div>`;
      }).join('')
    : '';

  const recsHtml = manualRecommendations.length > 0
    ? manualRecommendations.map((r) => `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:11px 14px;margin-bottom:10px;font-size:12px">
          <div style="margin-bottom:5px"><strong>${r.title || '-'}</strong> <em style="color:#6b7280;font-weight:400">(${r.type || '-'})</em></div>
          <p style="margin-bottom:3px;color:#374151">${r.content || '-'}</p>
          <small style="font-size:10px;color:#9ca3af">Oleh ${r.physio?.name || 'Fisioterapis'} — ${r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'}</small>
        </div>`).join('')
    : '<p style="color:#9ca3af;font-size:12px">Belum ada rekomendasi dari fisioterapis.</p>';

  const aiRecsHtml = aiRecs.length > 0
    ? aiRecs.map((r) => `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:11px 14px;margin-bottom:10px;font-size:12px">
          <span style="display:inline-block;font-size:9px;font-weight:700;background:#eff6ff;color:#2563eb;border-radius:4px;padding:1px 7px;margin-bottom:6px">${r.view}</span>
          <p style="margin-bottom:3px;color:#374151"><strong>Masalah:</strong> ${r.issue || '-'}</p>
          <p style="margin-bottom:3px;color:#374151"><strong>Latihan:</strong> ${r.exercise || '-'}</p>
          <p style="margin-bottom:3px;color:#374151"><strong>Durasi:</strong> ${r.duration || '-'}</p>
          ${r.parent_note ? `<div style="background:#fef9c3;border-radius:6px;padding:5px 9px;font-size:11px;color:#92400e;margin-top:5px">${r.parent_note}</div>` : ''}
        </div>`).join('')
    : '';

  const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const printTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const screenDate = created_at
    ? new Date(created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Laporan Screening — ${child?.name || 'Anak'}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: #e5e7eb; font-size: 13px; line-height: 1.65; }
    .page { width: 210mm; min-height: 297mm; margin: 20px auto; padding: 28px 36px 32px; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
    .page-break { page-break-before: always; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 8px 12px; text-align: left; border: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
    tr:nth-child(even) td { background: #fafafa; }
    .print-btn { display: block; position: fixed; top: 16px; right: 16px; background: ${themeColor}; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; z-index: 999; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    @media print {
      body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { margin: 0; width: 100%; padding: 16px 20px; box-shadow: none; }
      .page-break { page-break-before: always; }
      section { page-break-inside: avoid; }
      .print-btn { display: none !important; }
    }
  </style>
</head>
<body>

<button class="print-btn" onclick="window.print()">Cetak / Simpan PDF</button>

<div class="page">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid ${themeColor};margin-bottom:22px">
    <div>
      <div style="font-size:17px;font-weight:800;color:${themeColor};letter-spacing:-0.5px">Posturely</div>
      <h1 style="font-size:17px;font-weight:700;margin-top:2px">Laporan Hasil Screening Postur Anak</h1>
      <div style="font-size:10px;color:#9ca3af;margin-top:3px">Dicetak ${printDate} pukul ${printTime}</div>
    </div>
    <div style="text-align:right">
      <div style="display:inline-block;padding:4px 14px;border-radius:999px;font-size:11px;font-weight:700;color:#fff;background:${themeColor}">${cat.label}</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:5px">Halaman 1 dari 2</div>
    </div>
  </div>

  <!-- Info Row -->
  <div style="display:flex;align-items:center;gap:22px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px 22px;margin-bottom:18px">
    <div style="flex-shrink:0;width:80px;height:80px;border-radius:50%;border:5px solid ${themeColor};display:flex;flex-direction:column;align-items:center;justify-content:center">
      <span style="font-size:24px;font-weight:800;color:${themeColor};line-height:1">${score != null ? Number(score).toFixed(0) : '-'}</span>
      <span style="font-size:9px;color:#9ca3af;margin-top:2px">SKOR</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px 20px;flex:1">
      <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af">Nama Anak</div><div style="font-size:13px;font-weight:600;margin-top:1px">${child?.name || '-'}</div></div>
      <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af">Usia</div><div style="font-size:13px;font-weight:600;margin-top:1px">${child?.age_years ? child.age_years + ' tahun' : '-'}</div></div>
      <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af">Jenis Kelamin</div><div style="font-size:13px;font-weight:600;margin-top:1px">${child?.gender === 'M' ? 'Laki-laki' : child?.gender === 'F' ? 'Perempuan' : '-'}</div></div>
      <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af">Berat Badan</div><div style="font-size:13px;font-weight:600;margin-top:1px">${child?.weight ?? '-'} kg</div></div>
      <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af">Tinggi Badan</div><div style="font-size:13px;font-weight:600;margin-top:1px">${child?.height ?? '-'} cm</div></div>
      <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af">Tanggal Screening</div><div style="font-size:13px;font-weight:600;margin-top:1px">${screenDate}</div></div>
    </div>
  </div>

  ${summary ? `<div style="border-left:4px solid ${themeColor};background:#f9fafb;padding:11px 14px;border-radius:0 8px 8px 0;font-size:12px;color:#374151;margin-bottom:22px;line-height:1.7">${summary}</div>` : ''}

  ${(metricRows || findingsRows) ? `
  <section style="margin-bottom:22px">
    <h2 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;padding-bottom:6px;border-bottom:1px solid #e5e7eb;margin-bottom:12px">Detail Pengukuran</h2>
    ${metricRows ? `<table><thead><tr><th>Area</th><th>Nilai</th><th>Status</th></tr></thead><tbody>${metricRows}</tbody></table>` : ''}
    ${findingsRows ? `<table style="margin-top:${metricRows ? '12px' : '0'}"><thead><tr><th>Area</th><th>Detail Temuan</th><th>Tingkat Keparahan</th></tr></thead><tbody>${findingsRows}</tbody></table>` : ''}
  </section>` : ''}

  ${aiRecsHtml ? `
  <section style="margin-bottom:22px">
    <h2 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;padding-bottom:6px;border-bottom:1px solid #e5e7eb;margin-bottom:12px">Rekomendasi Latihan (AI)</h2>
    ${aiRecsHtml}
  </section>` : ''}

  ${physiotherapist ? `
  <section style="margin-bottom:22px">
    <h2 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;padding-bottom:6px;border-bottom:1px solid #e5e7eb;margin-bottom:12px">Status Konsultasi Fisioterapis</h2>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;font-size:12px">
      <p style="margin-bottom:3px"><strong>${physiotherapist.name}</strong>${physiotherapist.clinic_name ? ` · ${physiotherapist.clinic_name}` : ''}${physiotherapist.city ? ` · ${physiotherapist.city}` : ''}</p>
      <span style="display:inline-block;margin-top:4px;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;background:#dbeafe;color:#1d4ed8">${statusMap[referral_status] || '-'}</span>
    </div>
  </section>` : ''}

  <section style="margin-bottom:22px">
    <h2 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;padding-bottom:6px;border-bottom:1px solid #e5e7eb;margin-bottom:12px">Rekomendasi dari Fisioterapis</h2>
    ${recsHtml}
  </section>

  <div style="margin-top:28px;border-top:1px solid #e5e7eb;padding-top:10px;font-size:9px;color:#9ca3af;display:flex;justify-content:space-between">
    <span>Posturely — Sistem Monitoring Postur Anak © ${new Date().getFullYear()}</span>
    <span>Dokumen ini bersifat rahasia dan hanya untuk keperluan medis</span>
  </div>
</div>

<!-- Halaman 2 -->
<div class="page page-break">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid ${themeColor};margin-bottom:22px">
    <div>
      <div style="font-size:17px;font-weight:800;color:${themeColor};letter-spacing:-0.5px">Posturely</div>
      <div style="font-size:15px;font-weight:800;color:#111827;margin-bottom:4px">Lampiran Foto Screening</div>
      <div style="font-size:11px;color:#9ca3af">Nama: <strong>${child?.name || '-'}</strong> &nbsp;·&nbsp; Tanggal: ${screenDate}</div>
    </div>
    <div style="text-align:right">
      <div style="display:inline-block;padding:4px 14px;border-radius:999px;font-size:11px;font-weight:700;color:#fff;background:${themeColor}">${cat.label}</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:5px">Halaman 2 dari 2</div>
    </div>
  </div>

  ${mainImages.length > 0 ? `
  <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;padding-bottom:6px;border-bottom:1px solid #e5e7eb;margin-bottom:14px;margin-top:20px">Foto Analisis Postur</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px">
    ${mainPhotosHtml}
  </div>` : `<p style="color:#9ca3af;font-size:12px;margin-bottom:16px">Tidak ada foto screening yang tersedia.</p>`}

  ${cropImages.length > 0 ? `
  <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;padding-bottom:6px;border-bottom:1px solid #e5e7eb;margin-bottom:14px;margin-top:28px">Area Deviasi Terdeteksi</div>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;font-size:12px;color:#dc2626;margin-bottom:14px">
    Gambar berikut menunjukkan area tubuh yang terdeteksi memiliki deviasi postur berdasarkan analisis.
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:14px">
    ${cropPhotosHtml}
  </div>` : ''}

  ${mainImages.length === 0 && cropImages.length === 0 ? `
  <div style="text-align:center;padding:60px 0;color:#9ca3af">
    <p>Tidak ada foto yang dilampirkan dalam screening ini.</p>
  </div>` : ''}

  <div style="margin-top:auto;padding-top:28px;border-top:1px solid #e5e7eb;font-size:9px;color:#9ca3af;display:flex;justify-content:space-between">
    <span>Posturely — Sistem Monitoring Postur Anak © ${new Date().getFullYear()}</span>
    <span>Dokumen ini bersifat rahasia dan hanya untuk keperluan medis</span>
  </div>
</div>

</body>
</html>`;
}

// Download langsung sebagai file HTML (tanpa window.open)
export function exportScreeningPDF(data) {
  if (!data) return;
  const html = generateScreeningHTML(data);
  const childName = data?.child?.name?.replace(/\s+/g, '-') || 'Anak';
  const dateStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan-Screening-${childName}-${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}