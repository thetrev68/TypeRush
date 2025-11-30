export class ActiveWordTracker {
  constructor(playfield) {
    this.playfield = playfield;
  }

  update(falling) {
    // Remove active class from all words
    falling.forEach(f => {
      if (f.el) {
        f.el.classList.remove('active-word');
      }
    });

    if (falling.length === 0) return null;

    // Find the word closest to bottom (highest position)
    let activeEntry = falling[0];
    const playfieldRect = this.playfield.getBoundingClientRect();

    falling.forEach(entry => {
      if (!entry.el) return;
      const rect = entry.el.getBoundingClientRect();
      if (rect.top > playfieldRect.top) {
        const entryBottom = rect.bottom;
        const activeBottom = activeEntry.el.getBoundingClientRect().bottom;
        if (entryBottom > activeBottom) {
          activeEntry = entry;
        }
      }
    });

    if (activeEntry && activeEntry.el) {
      activeEntry.el.classList.add('active-word');
    }

    return activeEntry;
  }
}
