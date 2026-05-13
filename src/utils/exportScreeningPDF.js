// src/utils/exportScreeningPDF.js

// Laporan 2 halaman:
//   Hal. 1 — Info anak, skor, ringkasan, metrik, status konsultasi, rekomendasi fisio
//   Hal. 2 — Lampiran foto screening (depan/samping/belakang) + foto deviasi crop

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

export function exportScreeningPDF(data) {
  if (!data) return;

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
        <td>Kemiringan Bahu</td>
        <td>${Number(m.shoulder_tilt_index).toFixed(2)}%</td>
        <td class="${m.shoulder_tilt_index < 2 ? 'ok' : 'warn'}">${m.shoulder_tilt_index < 2 ? 'Normal' : 'Deviasi'}</td>
      </tr>`,
    m.hip_tilt_index !== undefined && `
      <tr>
        <td>Kemiringan Panggul</td>
        <td>${Number(m.hip_tilt_index).toFixed(2)}%</td>
        <td class="${m.hip_tilt_index < 2 ? 'ok' : 'warn'}">${m.hip_tilt_index < 2 ? 'Normal' : 'Deviasi'}</td>
      </tr>`,
    m.forward_head_index !== undefined && `
      <tr>
        <td>Forward Head Posture</td>
        <td>${Number(m.forward_head_index).toFixed(2)}</td>
        <td class="${m.forward_head_index < 0.2 ? 'ok' : 'warn'}">${m.forward_head_index < 0.2 ? 'Normal' : 'Terdeteksi'}</td>
      </tr>`,
    m.neck_inclination_deg !== undefined && `
      <tr>
        <td>Kemiringan Leher</td>
        <td>${Number(m.neck_inclination_deg).toFixed(1)}°</td>
        <td class="${m.neck_inclination_deg < 15 ? 'ok' : 'warn'}">${m.neck_inclination_deg < 15 ? 'Normal' : 'Deviasi'}</td>
      </tr>`,
    m.torso_inclination_deg !== undefined && `
      <tr>
        <td>Kemiringan Punggung</td>
        <td>${Number(m.torso_inclination_deg).toFixed(1)}°</td>
        <td class="${m.torso_inclination_deg < 15 ? 'ok' : 'warn'}">${m.torso_inclination_deg < 15 ? 'Normal' : 'Deviasi'}</td>
      </tr>`,
  ].filter(Boolean).join('');

  const findingsRows = Array.isArray(m.findings) && m.findings.length > 0
    ? m.findings.map((f) => `
        <tr>
          <td>${f.area || '-'}</td>
          <td>${f.detail || '-'}</td>
          <td class="${f.severity === 'Ringan' ? 'ok' : 'warn'}">${f.severity || '-'}</td>
        </tr>`).join('')
    : '';

  const aiRecs = mainImages.flatMap((img) =>
    (img.recommendations || []).map((r) => ({ ...r, view: typeLabel(img.type) }))
  );

  const mainPhotosHtml = mainImages.length > 0
    ? mainImages.map((img) => {
        const src = img.url_processed || img.url_original;
        return `
          <div class="photo-card">
            <div class="photo-img-wrap">
              <img src="${src}" alt="${typeLabel(img.type)}"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
              <div class="photo-err" style="display:none">Foto tidak dapat dimuat</div>
            </div>
            <div class="photo-label">${typeLabel(img.type)}</div>
            ${img.url_processed ? '<div class="photo-badge">Hasil Analisis AI</div>' : '<div class="photo-badge photo-badge--orig">Foto Original</div>'}
          </div>`;
      }).join('')
    : '<p style="color:#9ca3af;font-size:12px">Tidak ada foto screening.</p>';

  const cropPhotosHtml = cropImages.length > 0
    ? cropImages.map((img) => {
        const src = img.url_original || img.url_processed;
        return `
          <div class="photo-card photo-card--crop">
            <div class="photo-img-wrap">
              <img src="${src}" alt="${cropLabel(img.type)}"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
              <div class="photo-err" style="display:none">Foto tidak dapat dimuat</div>
            </div>
            <div class="photo-label">${cropLabel(img.type)}</div>
          </div>`;
      }).join('')
    : '';

  const recsHtml = manualRecommendations.length > 0
    ? manualRecommendations.map((r) => `
        <div class="rec-item">
          <div class="rec-title"><strong>${r.title || '-'}</strong> <em style="color:#6b7280;font-weight:400">(${r.type || '-'})</em></div>
          <p>${r.content || '-'}</p>
          <small>Oleh ${r.physio?.name || 'Fisioterapis'} — ${r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'}</small>
        </div>`).join('')
    : '<p style="color:#9ca3af;font-size:12px">Belum ada rekomendasi dari fisioterapis.</p>';

  const aiRecsHtml = aiRecs.length > 0
    ? aiRecs.map((r) => `
        <div class="rec-item">
          <span class="rec-view-badge">${r.view}</span>
          <p><strong>Masalah:</strong> ${r.issue || '-'}</p>
          <p><strong>Latihan:</strong> ${r.exercise || '-'}</p>
          <p><strong>Durasi:</strong> ${r.duration || '-'}</p>
          ${r.parent_note ? `<div class="rec-note">${r.parent_note}</div>` : ''}
        </div>`).join('')
    : '';

  const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const printTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const screenDate = created_at
    ? new Date(created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Laporan Screening — ${child?.name || 'Anak'}</title>
  <link rel="stylesheet" href="/screening-report.css" />
  <style>
    :root {
      --theme-color: ${themeColor};
    }
  </style>
</head>
<body>

<button class="print-btn" onclick="window.print()">Cetak / Simpan PDF</button>

<div class="page">
  <div class="doc-header">
    <div>
      <div class="logo">Posturely</div>
      <h1>Laporan Hasil Screening Postur Anak</h1>
      <div class="meta">Dicetak ${printDate} pukul ${printTime}</div>
    </div>
    <div style="text-align:right">
      <div class="badge">${cat.label}</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:5px">Halaman 1 dari 2</div>
    </div>
  </div>

  <div class="info-row">
    <div class="score-circle">
      <span class="score-val">${score != null ? Number(score).toFixed(0) : '-'}</span>
      <span class="score-lbl">SKOR</span>
    </div>
    <div class="info-grid">
      <div class="info-cell">
        <div class="lbl">Nama Anak</div>
        <div class="val">${child?.name || '-'}</div>
      </div>
      <div class="info-cell">
        <div class="lbl">Usia</div>
        <div class="val">${child?.age_years ? child.age_years + ' tahun' : '-'}</div>
      </div>
      <div class="info-cell">
        <div class="lbl">Jenis Kelamin</div>
        <div class="val">${child?.gender === 'M' ? 'Laki-laki' : child?.gender === 'F' ? 'Perempuan' : '-'}</div>
      </div>
      <div class="info-cell">
        <div class="lbl">Berat Badan</div>
        <div class="val">${child?.weight ?? '-'} kg</div>
      </div>
      <div class="info-cell">
        <div class="lbl">Tinggi Badan</div>
        <div class="val">${child?.height ?? '-'} cm</div>
      </div>
      <div class="info-cell">
        <div class="lbl">Tanggal Screening</div>
        <div class="val">${screenDate}</div>
      </div>
    </div>
  </div>

  ${summary ? `<div class="summary">${summary}</div>` : ''}

  ${(metricRows || findingsRows) ? `
  <section>
    <h2>Detail Pengukuran</h2>
    ${metricRows ? `
    <table>
      <thead><tr><th>Area</th><th>Nilai</th><th>Status</th></tr></thead>
      <tbody>${metricRows}</tbody>
    </table>` : ''}
    ${findingsRows ? `
    <table style="margin-top:${metricRows ? '12px' : '0'}">
      <thead><tr><th>Area</th><th>Detail Temuan</th><th>Tingkat Keparahan</th></tr></thead>
      <tbody>${findingsRows}</tbody>
    </table>` : ''}
  </section>` : ''}

  ${aiRecsHtml ? `
  <section>
    <h2>Rekomendasi Latihan (AI)</h2>
    ${aiRecsHtml}
  </section>` : ''}

  ${physiotherapist ? `
  <section>
    <h2>Status Konsultasi Fisioterapis</h2>
    <div class="physio-card">
      <p><strong>${physiotherapist.name}</strong>
        ${physiotherapist.clinic_name ? ` &middot; ${physiotherapist.clinic_name}` : ''}
        ${physiotherapist.city        ? ` &middot; ${physiotherapist.city}`        : ''}
      </p>
      <span class="physio-status">${statusMap[referral_status] || '-'}</span>
    </div>
  </section>` : ''}

  <section>
    <h2>Rekomendasi dari Fisioterapis</h2>
    ${recsHtml}
  </section>

  <div class="doc-footer">
    <span>Posturely — Sistem Monitoring Postur Anak © ${new Date().getFullYear()}</span>
    <span>Dokumen ini bersifat rahasia dan hanya untuk keperluan medis</span>
  </div>
</div>

<div class="page page-break">
  <div class="doc-header">
    <div>
      <div class="logo">Posturely</div>
      <div class="page2-title">Lampiran Foto Screening</div>
      <div class="page2-sub">Nama: <strong>${child?.name || '-'}</strong> &nbsp;·&nbsp; Tanggal: ${screenDate}</div>
    </div>
    <div style="text-align:right">
      <div class="badge">${cat.label}</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:5px">Halaman 2 dari 2</div>
    </div>
  </div>

  ${mainImages.length > 0 ? `
  <div class="photo-section-title">Foto Analisis Postur</div>
  <div class="photo-grid">
    ${mainPhotosHtml}
  </div>` : `<p style="color:#9ca3af;font-size:12px;margin-bottom:16px">Tidak ada foto screening yang tersedia.</p>`}

  ${cropImages.length > 0 ? `
  <div class="photo-section-title" style="margin-top:28px">Area Deviasi Terdeteksi</div>
  <div class="deviation-note">
    Gambar berikut menunjukkan area tubuh yang terdeteksi memiliki deviasi postur berdasarkan analisis.
  </div>
  <div class="photo-grid photo-grid--crop">
    ${cropPhotosHtml}
  </div>` : ''}

  ${mainImages.length === 0 && cropImages.length === 0 ? `
  <div style="text-align:center;padding:60px 0;color:#9ca3af">
    <p>Tidak ada foto yang dilampirkan dalam screening ini.</p>
  </div>` : ''}

  <div class="doc-footer" style="margin-top:auto">
    <span>Posturely — Sistem Monitoring Postur Anak © ${new Date().getFullYear()}</span>
    <span>Dokumen ini bersifat rahasia dan hanya untuk keperluan medis</span>
  </div>
</div>

</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=820,scrollbars=yes');
  if (!win) {
    alert('Pop-up diblokir browser. Izinkan pop-up untuk halaman ini, lalu coba lagi.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
}