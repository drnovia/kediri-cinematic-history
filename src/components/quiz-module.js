// Interactive History Quiz & Certificate Generator Component
import { quizData, ranks } from '../data/quiz.js';
import { appState } from '../core/state.js';
import { translations } from '../data/i18n.js';
import { audioManager } from '../core/audio.js';
import { showToast } from '../core/utils.js';

export function initQuizModule() {
  const container = document.querySelector('#quiz-module-root');
  if (!container) return;

  renderQuizUI(container);
  bindQuizEvents(container);

  appState.subscribe('lang', () => {
    renderQuizUI(container);
    bindQuizEvents(container);
  });
}

function renderQuizUI(container) {
  const lang = appState.get('lang');
  const t = translations[lang].quizSection;
  const currentStep = appState.get('quizStep') || 0;
  const answers = appState.get('quizAnswers') || {};
  const isCompleted = appState.get('quizCompleted') || false;

  if (isCompleted) {
    renderResultView(container, lang, t, answers);
    return;
  }

  const q = quizData[currentStep];
  const questionText = lang === 'id' ? q.questionId : q.questionEn;
  const options = lang === 'id' ? q.optionsId : q.optionsEn;
  const selectedAnswer = answers[q.id];

  container.innerHTML = `
    <div class="quiz-container-card">
      <div class="quiz-header-row">
        <div>
          <p class="eyebrow">${t.eyebrow}</p>
          <h2 class="quiz-title">${t.title}</h2>
          <p class="quiz-subtitle">${t.subtitle}</p>
        </div>
        <div class="quiz-progress-badge">
          <span class="quiz-progress-num">SOAL ${currentStep + 1} / ${quizData.length}</span>
          <div class="quiz-progress-bar-bg">
            <div class="quiz-progress-fill" style="width: ${((currentStep + 1) / quizData.length) * 100}%"></div>
          </div>
        </div>
      </div>

      <div class="quiz-question-box visual-frame">
        <h3 class="quiz-q-text">${questionText}</h3>
        
        <div class="quiz-options-list" role="radiogroup" aria-label="Pilihan Jawaban">
          ${options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const hasAnswered = selectedAnswer !== undefined;
            let statusClass = '';
            if (hasAnswered) {
              if (idx === q.correctIndex) statusClass = 'is-correct';
              else if (isSelected) statusClass = 'is-wrong';
            }

            return `
              <button 
                type="button" 
                class="quiz-option-btn ${isSelected ? 'is-selected' : ''} ${statusClass}" 
                data-idx="${idx}"
                ${hasAnswered ? 'disabled' : ''}
              >
                <span class="opt-alpha">${String.fromCharCode(65 + idx)}</span>
                <span class="opt-text">${opt}</span>
                ${hasAnswered && idx === q.correctIndex ? '<span class="opt-check">✓</span>' : ''}
                ${hasAnswered && isSelected && idx !== q.correctIndex ? '<span class="opt-cross">✗</span>' : ''}
              </button>
            `;
          }).join('')}
        </div>

        ${selectedAnswer !== undefined ? `
          <div class="quiz-explanation-box ${selectedAnswer === q.correctIndex ? 'exp-correct' : 'exp-wrong'}">
            <span class="exp-title">${selectedAnswer === q.correctIndex ? '✓ JAWABAN TEPAT!' : '✗ KURANG TEPAT'}</span>
            <p class="exp-text">${lang === 'id' ? q.explanationId : q.explanationEn}</p>
          </div>
        ` : ''}

        <div class="quiz-nav-actions">
          ${selectedAnswer !== undefined ? `
            <button type="button" class="btn-quiz-next" id="btn-quiz-next">
              <span>${currentStep === quizData.length - 1 ? t.finishBtn : t.nextBtn} →</span>
            </button>
          ` : `
            <p class="quiz-prompt-hint">Pilih salah satu jawaban di atas untuk melanjutkan.</p>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderResultView(container, lang, t, answers) {
  let score = 0;
  quizData.forEach((q) => {
    if (answers[q.id] === q.correctIndex) score++;
  });

  const rank = ranks.find(r => score >= r.minScore) || ranks[ranks.length - 1];
  const rankTitle = lang === 'id' ? rank.titleId : rank.titleEn;
  const rankDesc = lang === 'id' ? rank.descId : rank.descEn;

  container.innerHTML = `
    <div class="quiz-result-card visual-frame">
      <div class="result-header">
        <span class="result-badge-pill" style="border-color: ${rank.badgeColor}; color: ${rank.badgeColor}">${rank.badge}</span>
        <h2 class="result-title">${t.certificateTitle}</h2>
        <p class="result-subtitle">${rankTitle}</p>
      </div>

      <div class="result-score-display">
        <div class="score-circle" style="border-color: ${rank.badgeColor}">
          <span class="score-num">${score}</span>
          <small>/ ${quizData.length}</small>
        </div>
        <p class="result-desc-text">${rankDesc}</p>
      </div>

      <!-- Live Interactive Certificate Card -->
      <div class="certificate-preview-box" id="certificate-preview-box">
        <div class="cert-border-gold">
          <div class="cert-header-seal">K</div>
          <h3>PIAGAM PENGHARGAAN SEJARAH</h3>
          <p class="cert-given-text">${t.certifyText}</p>
          <div class="cert-user-name" id="cert-user-name-display">PENJELAJAH ARSIP KEDIRI</div>
          <div class="cert-meta-row">
            <span>GELAR: <strong>${rankTitle}</strong></span>
            <span>SKOR: <strong>${score} / ${quizData.length}</strong></span>
            <span>TANGGAL: <strong>${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
          </div>
        </div>
      </div>

      <div class="cert-actions-row">
        <input 
          type="text" 
          id="cert-name-input" 
          class="cert-name-input" 
          placeholder="${t.inputNamePlaceholder}" 
          maxlength="36"
        />
        <button type="button" class="btn-cert-download" id="btn-cert-download">
          <span>${t.generateCertBtn}</span>
        </button>
        <button type="button" class="btn-quiz-restart" id="btn-quiz-restart">
          <span>${t.restartBtn} ↺</span>
        </button>
      </div>
    </div>
  `;

  const nameInput = container.querySelector('#cert-name-input');
  const nameDisplay = container.querySelector('#cert-user-name-display');
  const copyBtn = container.querySelector('#btn-cert-download');
  const restartBtn = container.querySelector('#btn-quiz-restart');

  if (nameInput && nameDisplay) {
    nameInput.addEventListener('input', () => {
      nameDisplay.textContent = nameInput.value.trim() || (lang === 'id' ? 'PENJELAJAH ARSIP KEDIRI' : 'KEDIRI ARCHIVE EXPLORER');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      audioManager.playUiClick();
      const userName = nameDisplay.textContent;
      const certText = `🏛️ [SERTIFIKAT KURATOR SEJARAH KEDIRI]\nDiberikan kepada: ${userName}\nGelar: ${rankTitle}\nSkor: ${score}/${quizData.length} (100% Verified)\nDigital Museum: Kediri - A Century of History, Kings, and Industry.`;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(certText).then(() => {
          showToast('✓ Salinan teks sertifikat berhasil disalin ke papan klip!');
        });
      } else {
        showToast('✓ Sertifikat siap dibagikan!');
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      audioManager.playUiClick();
      appState.set('quizStep', 0);
      appState.set('quizAnswers', {});
      appState.set('quizCompleted', false);
      renderQuizUI(container);
      bindQuizEvents(container);
    });
  }
}

function bindQuizEvents(container) {
  const currentStep = appState.get('quizStep') || 0;
  const answers = appState.get('quizAnswers') || {};
  const q = quizData[currentStep];

  const optionBtns = container.querySelectorAll('.quiz-option-btn');
  const nextBtn = container.querySelector('#btn-quiz-next');

  optionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      audioManager.playUiClick();
      const selectedIdx = parseInt(btn.dataset.idx, 10);
      answers[q.id] = selectedIdx;
      appState.set('quizAnswers', { ...answers });

      if (selectedIdx === q.correctIndex) {
        audioManager.playGamelanBell(523.25);
      }

      renderQuizUI(container);
      bindQuizEvents(container);
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      audioManager.playUiClick();
      if (currentStep < quizData.length - 1) {
        appState.set('quizStep', currentStep + 1);
      } else {
        appState.set('quizCompleted', true);
      }
      renderQuizUI(container);
      bindQuizEvents(container);
    });
  }
}
