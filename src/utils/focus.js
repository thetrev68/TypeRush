export const setupFocusManagement = (hiddenInput) => {
  let currentThumbSide = null;

  const focusInput = (e) => {
    // Don't steal focus from select elements
    if (e && e.target && (e.target.tagName === 'SELECT' || e.target.closest('.lesson-select'))) {
      return;
    }
    hiddenInput.focus({ preventScroll: true });
    hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length);
  };

  ['click', 'touchstart'].forEach((evt) => {
    document.addEventListener(evt, focusInput, { passive: true });
  });

  document.addEventListener(
    'touchstart',
    (e) => {
      const x = e.touches[0].clientX;
      currentThumbSide = x < window.innerWidth / 2 ? 'left' : 'right';
    },
    { passive: true }
  );

  return {
    focusInput,
    getCurrentThumbSide: () => currentThumbSide,
    setCurrentThumbSide: (side) => { currentThumbSide = side; }
  };
};
