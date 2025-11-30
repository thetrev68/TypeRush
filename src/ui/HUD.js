export class HUD {
  constructor(elements, metricsCalculator) {
    this.scoreVal = elements.scoreVal;
    this.bestVal = elements.bestVal;
    this.livesVal = elements.livesVal;
    this.speedVal = elements.speedVal;
    this.wpmVal = elements.wpmVal;
    this.accuracyVal = elements.accuracyVal;
    this.comboVal = elements.comboVal;
    this.metricsCalc = metricsCalculator;
  }

  update(state) {
    this.scoreVal.textContent = state.score.toString();
    this.bestVal.textContent = state.highScore.toString();
    this.livesVal.textContent = `${state.lives}`;
    this.speedVal.textContent = `Lv ${state.level}`;
    this.wpmVal.textContent = this.metricsCalc.calculateWPM(state.recentWords).toString();
    const acc = this.metricsCalc.calculateAccuracy(state.correctThumbs, state.totalThumbs);
    this.accuracyVal.textContent = `${acc}%`;
    this.comboVal.textContent = `x${this.metricsCalc.calculateComboMultiplier(state.combo)}`;
  }
}
