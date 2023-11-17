import { InsightCategory } from "@domain/valueobjects/options";

export class Insights {
  private numericScores: Record<InsightCategory, number> = {} as Record<
    InsightCategory,
    number
  >;
  private pwa: PWAMetric = PWAMetric.NA;

  constructor(
    performanceScore: number,
    a11yScore?: number,
    bestPracticesScore?: number,
    seoScore?: number,
    pwaScore?: number
  ) {
    this.numericScores[InsightCategory.PERFORMANCE] = performanceScore * 100;
    if (a11yScore) {
      this.numericScores[InsightCategory.ACCESSIBILITY] = a11yScore * 100;
    }
    if (bestPracticesScore) {
      this.numericScores[InsightCategory.BEST_PRACTICES] =
        bestPracticesScore * 100;
    }

    if (seoScore) {
      this.numericScores[InsightCategory.SEO] = seoScore * 100;
    }

    if (pwaScore) {
      this.pwa = this.parsePWAScore(pwaScore);
    }
  }

  public getNumericScoresByCategory(): Record<InsightCategory, number> {
    return this.numericScores;
  }

  public getPWAScore(): PWAMetric {
    return this.pwa;
  }

  private parsePWAScore(pwaScore: number): PWAMetric {
    const metricByScore: Record<number, PWAMetric> = {
      0: PWAMetric.NA,
      1: PWAMetric.RELIABLE,
      2: PWAMetric.INSTALLABLE,
      3: PWAMetric.OPTIMIZED,
      7: PWAMetric.ALL,
    };

    if (!metricByScore[pwaScore]) {
      throw new DOMException(`Invalid PWA score: ${pwaScore}`);
    }

    return metricByScore[pwaScore];
  }
}

export enum PWAMetric {
  NA = "n/a",
  INSTALLABLE = "pwa-installable",
  RELIABLE = "pwa-fast-reliable",
  OPTIMIZED = "pwa-optimized",
  ALL = "all",
}