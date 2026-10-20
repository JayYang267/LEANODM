function initializeSoundBookLanguages(section: HTMLElement) {
  if (section.dataset.languageInitialized) return;
  section.dataset.languageInitialized = 'true';
  const previews = [...section.querySelectorAll<HTMLButtonElement>('[data-preview-language]')];
  const panels = [...section.querySelectorAll<HTMLElement>('[data-language-panel]')];
  const additions = [...section.querySelectorAll<HTMLButtonElement>('[data-add-inquiry-language]')];
  const status = section.querySelector<HTMLElement>('[data-language-status]');

  function showLanguage(code: string) {
    if (!panels.some(panel => panel.dataset.languagePanel === code)) return;
    for (const panel of panels) panel.hidden = panel.dataset.languagePanel !== code;
    for (const button of previews) button.setAttribute('aria-pressed', String(button.dataset.previewLanguage === code));
  }

  for (const button of previews) {
    button.disabled = false;
    button.addEventListener('click', () => showLanguage(button.dataset.previewLanguage || 'en'));
  }
  for (const button of additions) {
    button.disabled = false;
    button.addEventListener('click', () => {
      const language = button.dataset.addInquiryLanguage;
      if (!language || !['English', 'Japanese', 'Arabic'].includes(language)) return;
      const selected = [...document.querySelectorAll<HTMLInputElement>('form[data-sound-book-inquiry] input[name="languages"]:checked')].map(input => input.value);
      const languages = [...new Set([...selected, language])];
      document.dispatchEvent(new CustomEvent('soundbook:inquiry-selection', { detail: { languages } }));
      const confirmed = [...document.querySelectorAll<HTMLInputElement>('form[data-sound-book-inquiry] input[name="languages"]:checked')].some(input => input.value === language);
      if (status) {
        status.hidden = false;
        status.textContent = confirmed ? `${language} added to your inquiry. You can change the language requirements in the form.` : `Continue to the inquiry form to confirm ${language} and your other language requirements.`;
      }
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('inquiry')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }
  // Choosing the initial preview has no effect on the inquiry checkboxes.
  showLanguage('en');
}

function initializeLanguagePreviews() {
  document.querySelectorAll<HTMLElement>('[data-sound-book-languages]').forEach(initializeSoundBookLanguages);
}

initializeLanguagePreviews();
document.addEventListener('astro:page-load', initializeLanguagePreviews);
