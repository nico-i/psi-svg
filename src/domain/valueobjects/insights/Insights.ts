export class Insights {
  private _performanceScore: number;
  private _a11yScore?: number;
  private _bestPracticesScore?: number;
  private _seoScore?: number;
  private _pwaScore: PWAMetric | undefined = undefined;

  constructor(
    performanceScore: number,
    a11yScore?: number,
    bestPracticesScore?: number,
    seoScore?: number,
    pwaScore?: number
  ) {
    this._performanceScore = Math.round(performanceScore * 100);

    if (a11yScore !== undefined) {
      this._a11yScore = Math.round(a11yScore * 100);
    }

    if (bestPracticesScore !== undefined) {
      this._bestPracticesScore = Math.round(bestPracticesScore * 100);
    }

    if (seoScore !== undefined) {
      this._seoScore = Math.round(seoScore * 100);
    }

    if (pwaScore !== undefined) {
      const pwaScoreStr = pwaScore.toString();
      if (!Object.keys(PWAMetricByScore).includes(pwaScoreStr)) {
        throw new DOMException(`Invalid PWA score: ${pwaScore}`);
      }
      this._pwaScore = PWAMetricByScore[pwaScore];
    }
  }
  get performanceScore(): number {
    return this._performanceScore;
  }

  get a11yScore(): number | undefined {
    return this._a11yScore;
  }

  get bestPracticesScore(): number | undefined {
    return this._bestPracticesScore;
  }

  get seoScore(): number | undefined {
    return this._seoScore;
  }

  get pwaScore(): PWAMetric | undefined {
    return this._pwaScore;
  }
}

export enum PWAMetric {
  NA = "n/a",
  INSTALLABLE = "pwa-installable",
  RELIABLE = "pwa-fast-reliable",
  OPTIMIZED = "pwa-optimized",
  ALL = "all",
}

export const PWAMetricByScore: Record<string, PWAMetric> = {
  "0": PWAMetric.NA,
  "1": PWAMetric.RELIABLE,
  "2": PWAMetric.INSTALLABLE,
  "3": PWAMetric.OPTIMIZED,
  "7": PWAMetric.ALL,
};
