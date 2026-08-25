// Interactive Bridge Blueprint Inspector Component for Chapter 05
import { audioManager } from '../core/audio.js';
import { appState } from '../core/state.js';

export function initBridgeInspector() {
  const container = document.querySelector('#bridge-inspector-root');
  if (!container) return;

  const hotspots = [
    {
      id: 'pier-west',
      x: '15%',
      y: '60%',
      titleId: 'Pilar Pondasi Barat (West Pier)',
      titleEn: 'West Pier Foundation',
      descId: 'Pondasi batu andesit bertulang yang ditanam menembus lapisan lempung dasar Sungai Brantas sedalam 8 meter untuk menahan abrasi arus deras.',
      descEn: 'Reinforced andesite stone masonry piers embedded 8 meters into the Brantas riverbed clay to withstand high-velocity monsoon currents.'
    },
    {
      id: 'truss-arch',
      x: '50%',
      y: '22%',
      titleId: 'Busur Rangka Besi Tempa (Groove Iron Truss)',
      titleEn: 'Wrought-Iron Truss Arch',
      descId: 'Rangka lengkung atas bertegangan lentur yang menyalurkan beban dinamis kendaraan ke kedua abutmen tepi sungai, mengurangi momen lentur tengah bentang.',
      descEn: 'Curved top chord distributing live traffic load directly toward the riverbank abutments, minimizing central bending moments.'
    },
    {
      id: 'rivet-node',
      x: '68%',
      y: '58%',
      titleId: 'Sambungan Paku Keling Panas (Hot Riveted Joint)',
      titleEn: 'Hot-Riveted Gusset Joint',
      descId: 'Dipasang menggunakan teknik penempaan panas manual abad ke-19, menghasilkan kekuatan jepit struktural elastis yang tahan terhadap gempa dan getaran.',
      descEn: 'Fastened using 19th-century manual hot-riveting methods, providing elastic shear strength resilient to seismic vibrations.'
    },
    {
      id: 'flood-marker',
      x: '85%',
      y: '78%',
      titleId: 'Batas Muka Air Banjir Historis (1954 / 2007)',
      titleEn: 'Historical High Flood Mark',
      descId: 'Tinggi jagaan (freeboard) 7.5 meter terbukti melindungi superstruktur jembatan dari luapan lahar dingin Gunung Kelud dan banjir musiman Brantas.',
      descEn: 'A 7.5-meter clearance designed to keep the bridge superstructure safe from Mount Kelud volcanic debris flows and monsoon floods.'
    }
  ];

  container.innerHTML = `
    <div class="bridge-hotspots-container">
      ${hotspots.map((h, i) => `
        <button 
          type="button" 
          class="bridge-hotspot-pin ${i === 1 ? 'is-active' : ''}" 
          style="left: ${h.x}; top: ${h.y};"
          data-id="${h.id}"
          aria-label="${h.titleId}"
        >
          <span class="hotspot-pulse"></span>
          <span class="hotspot-dot">0${i + 1}</span>
        </button>
      `).join('')}

      <div class="bridge-hotspot-card visual-frame" id="bridge-hotspot-card">
        <span class="eyebrow hotspot-eyebrow">DETAIL ELEMEN STRUKTUR (1869)</span>
        <h4 class="hotspot-title">${hotspots[1].titleId}</h4>
        <p class="hotspot-desc">${hotspots[1].descId}</p>
      </div>
    </div>
  `;

  const pins = container.querySelectorAll('.bridge-hotspot-pin');
  const card = container.querySelector('#bridge-hotspot-card');
  const titleEl = card.querySelector('.hotspot-title');
  const descEl = card.querySelector('.hotspot-desc');

  pins.forEach((pin) => {
    pin.addEventListener('click', () => {
      audioManager.playUiClick();
      pins.forEach(p => p.classList.remove('is-active'));
      pin.classList.add('is-active');

      const id = pin.dataset.id;
      const data = hotspots.find(h => h.id === id);
      if (!data) return;

      const lang = appState.get('lang');
      titleEl.textContent = lang === 'id' ? data.titleId : data.titleEn;
      descEl.textContent = lang === 'id' ? data.descId : data.descEn;
    });
  });
}
