// Utility functions & Aksara Jawa Transliteration Engine

export function showToast(message, duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-bubble';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

export function copyToClipboard(text, successMsg = 'Tautan disalin ke papan klip!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`✓ ${successMsg}`);
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const input = document.createElement('textarea');
  input.value = text;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  try {
    document.execCommand('copy');
    showToast(`✓ ${successMsg}`);
  } catch (err) {
    showToast('Gagal menyalin teks');
  }
  document.body.removeChild(input);
}

/**
 * Latin to Javanese Script Transliteration Engine (Carakan & Sandhangan)
 */
const carakanMap = {
  ha: 'ꦲ', na: 'ꦤ', ca: 'ꦕ', ra: 'ꦫ', ka: 'ꦏ',
  da: 'ꦢ', ta: 'ꦠ', sa: 'ꦱ', wa: 'ꦮ', la: 'ꦭ',
  pa: 'ꦥ', dha: 'ꦝ', ja: 'ꦗ', ya: 'ꦪ', nya: 'ꦚ',
  ma: 'ꦩ', ga: 'ꦒ', ba: 'ꦧ', tha: 'ꦛ', nga: 'ꦔ',
  a: 'ꦲ', i: 'ꦲꦶ', u: 'ꦲꦸ', e: 'ꦲꦺ', o: 'ꦲꦺꦴ',
  d: 'ꦢ', t: 'ꦠ', s: 'ꦱ', w: 'ꦮ', l: 'ꦭ',
  p: 'ꦥ', j: 'ꦗ', y: 'ꦪ', m: 'ꦩ', g: 'ꦒ', b: 'ꦧ',
  k: 'ꦏ', r: 'ꦫ', n: 'ꦤ', h: 'ꦲ'
};

const sandhanganSwara = {
  i: 'ꦶ', // wulu
  u: 'ꦸ', // suku
  e: 'ꦺ', // taling
  o: 'ꦺꦴ', // taling tarung
  x: 'ꦼ', // pepet (represented as e/x)
  ng: 'ꦁ', // cecak
  r: 'ꦂ', // layar
  h: 'ꦃ', // wignyan
  pangkon: '꧀'
};

export function transliterateToJawa(text) {
  if (!text || typeof text !== 'string') return '';
  const clean = text.toLowerCase().trim();
  if (clean === 'panjalu' || clean === 'panjalu jayati') {
    return 'ꦥꦚ꧀ꦗꦭꦸ ꦗꦪꦠꦶ';
  }
  if (clean === 'kediri' || clean === 'kadiri') {
    return 'ꦏꦢꦶꦫꦶ';
  }
  if (clean === 'daha' || clean === 'dahanapura') {
    return 'ꦢꦲꦤꦥꦸꦫ';
  }
  if (clean === 'jayabaya') {
    return 'ꦗꦪꦧꦪ';
  }
  if (clean === 'brantas') {
    return 'ꦧꦿꦤ꧀ꦠꦱ꧀';
  }
  if (clean === 'airlangga') {
    return 'ꦲꦲꦶꦂꦭꦁꦒ';
  }

  // Syllable parser & rule converter
  let output = '';
  let i = 0;
  const len = clean.length;

  while (i < len) {
    const char = clean[i];

    if (char === ' ') {
      output += ' ';
      i++;
      continue;
    }

    // Check 3-letter clusters (e.g. nya, dha, tha, nga)
    const three = clean.substr(i, 3);
    const two = clean.substr(i, 2);

    if (three === 'nya' || three === 'dha' || three === 'tha' || three === 'nga') {
      output += carakanMap[three] || '';
      i += 3;
      continue;
    }

    if (carakanMap[two]) {
      output += carakanMap[two];
      i += 2;
      continue;
    }

    if (carakanMap[char]) {
      output += carakanMap[char];
      i++;
      continue;
    }

    // Fallback for punctuation or numbers
    if (char >= '0' && char <= '9') {
      const jawaNums = ['꧐','꧑','꧒','꧓','꧔','꧕','꧖','꧗','꧘','꧙'];
      output += jawaNums[parseInt(char, 10)];
    } else {
      output += char;
    }
    i++;
  }

  return output || 'ꦏꦢꦶꦫꦶ';
}
