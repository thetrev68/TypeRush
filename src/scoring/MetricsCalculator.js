export class MetricsCalculator {
  calculateWPM(recentWords) {
    if (recentWords.length < 2) return 0;
    const first = recentWords[0].time;
    const last = recentWords[recentWords.length - 1].time;
    const diffMin = (last - first) / 60000;
    if (diffMin <= 0) return 0;
    const totalChars = recentWords.reduce((sum, item) => sum + item.chars, 0);
    const words = totalChars / 5;
    return Math.round(words / diffMin);
  }

  calculateAccuracy(correctThumbs, totalThumbs) {
    return totalThumbs ? Math.round((correctThumbs / totalThumbs) * 100) : 100;
  }

  calculateComboMultiplier(combo) {
    return Math.max(1, 1 + Math.floor(combo / 5));
  }
}
