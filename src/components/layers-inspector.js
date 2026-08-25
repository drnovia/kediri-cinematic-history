// Interactive 3D Stratigraphy Layer Exploder for Chapter 04 (Setono Gedong)
import { audioManager } from '../core/audio.js';
import { appState } from '../core/state.js';

export function initLayersInspector() {
  const container = document.querySelector('#layers-inspector-root');
  if (!container) return;

  const strataData = [
    {
      level: 'top',
      num: '04 / 03',
      nameId: 'LAPISAN KINI: LIVING HERITAGE & RUANG PUBLIK',
      nameEn: 'TOP STRATUM: LIVING HERITAGE & MEMORY',
      era: 'Abad 20 - 21 M',
      descId: 'Pusat ziarah multikultural, konservasi cagar budaya, dan interaksi warga kota yang merayakan kelangsungan peradaban Kediri.',
      descEn: 'A multicultural pilgrimage hub, cultural conservation center, and civic space celebrating civilizational continuity.'
    },
    {
      level: 'middle',
      num: '04 / 02',
      nameId: 'LAPISAN TRANSISI: ERA ISLAM AWAL',
      nameEn: 'MIDDLE STRATUM: EARLY ISLAMIC TRANSITION',
      era: 'Abad 15 - 16 M',
      descId: 'Kompleks makam Syaikh Wasil (Pangeran Mekkah), gapura bertorehkan motif sulur tanaman, dan orientasi kiblat baru di atas tanah suci lama.',
      descEn: 'Mausoleum of Syaikh Wasil, floral-motif stone gateways, and Islamic qibla orientation built respectfully upon earlier sacred grounds.'
    },
    {
      level: 'bottom',
      num: '04 / 01',
      nameId: 'LAPISAN DASAR: CANDI HINDU-BUDDHA PANJALU',
      nameEn: 'BOTTOM STRATUM: HINDU-BUDDHIST PANJALU SUBSTRATE',
      era: 'Abad 11 - 13 M',
      descId: 'Fondasi batur balok andesit, arca Garudeya Isyana, dan relief kisah pewayangan era Sri Jayabaya hingga Kertajaya.',
      descEn: 'Andesite stone plinths, Garudeya royal emblems, and narrative relief carvings dating back to the classical Kadiri realm.'
    }
  ];

  container.innerHTML = `
    <div class="strata-control-panel">
      <div class="strata-slider-wrap">
        <label for="strata-depth-range" class="eyebrow strata-label">KEDALAMAN EKSKAVASI STRATIGRAFI</label>
        <div class="strata-slider-row">
          <span class="strata-tier-tag">PERMUKAAN</span>
          <input 
            type="range" 
            id="strata-depth-range" 
            min="0" 
            max="2" 
            step="1" 
            value="0" 
            class="strata-range-input"
            aria-label="Slider kedalaman lapisan tanah Setono Gedong"
          />
          <span class="strata-tier-tag">FONDASI KUNO</span>
        </div>
      </div>
      <div class="strata-live-card visual-frame" id="strata-live-card">
        <span class="strata-card-num">${strataData[0].num}</span>
        <span class="strata-card-era">${strataData[0].era}</span>
        <h4 class="strata-card-name">${strataData[0].nameId}</h4>
        <p class="strata-card-desc">${strataData[0].descId}</p>
      </div>
    </div>
  `;

  const slider = container.querySelector('#strata-depth-range');
  const card = container.querySelector('#strata-live-card');
  const numEl = card.querySelector('.strata-card-num');
  const eraEl = card.querySelector('.strata-card-era');
  const nameEl = card.querySelector('.strata-card-name');
  const descEl = card.querySelector('.strata-card-desc');
  const cardsInDom = document.querySelectorAll('.layer-card');

  if (slider) {
    slider.addEventListener('input', () => {
      audioManager.playUiClick();
      const val = parseInt(slider.value, 10);
      const data = strataData[val];
      const lang = appState.get('lang');

      numEl.textContent = data.num;
      eraEl.textContent = data.era;
      nameEl.textContent = lang === 'id' ? data.nameId : data.nameEn;
      descEl.textContent = lang === 'id' ? data.descId : data.descEn;

      // Animate the physical layer cards in the stack
      cardsInDom.forEach((c, idx) => {
        if (idx === val) {
          c.classList.add('is-active-strata');
        } else {
          c.classList.remove('is-active-strata');
        }
      });
    });
  }
}
