export const findSafeSpawnPosition = (wordWidth, falling, playfield, rng) => {
  const maxLeft = Math.max(0, playfield.clientWidth - wordWidth - 20);
  
  // If playfield is too narrow, center the word horizontally as fallback
  if (maxLeft <= 0) {
    return Math.max(0, (playfield.clientWidth - wordWidth) / 2);
  }
  
  const minSpacing = 120; // Minimum pixels between words
  let attempts = 0;
  let left;

  while (attempts < 10) {
    left = rng() * maxLeft;
    let isSafe = true;

    // Check if this position overlaps with any existing word
    for (const entry of falling) {
      if (entry.el.dataset.removed === '1') continue;
      const existingLeft = parseFloat(entry.el.style.left);
      const distance = Math.abs(left - existingLeft);

      if (distance < minSpacing) {
        isSafe = false;
        break;
      }
    }

    if (isSafe) return left;
    attempts++;
  }

  // If we can't find a safe spot after 10 tries, use the farthest position
  return left;
};
