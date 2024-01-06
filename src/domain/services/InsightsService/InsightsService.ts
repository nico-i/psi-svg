import { InsightCategory, Insights, Options } from "@domain";
import { buildPageSpeedInsightsUrls, calcPWAScore, logger } from "@util";
require("dotenv").config();

export class InsightsService {
  private hostnameWhitelist: string[];

  constructor(hostnameWhitelist?: string[]) {
    this.hostnameWhitelist = hostnameWhitelist ?? [];
  }

  async getPageSpeedInsights(options: Options): Promise<Insights> {
    if (this.hostnameWhitelist.length > 0) {
      if (!this.hostnameWhitelist.includes(options.url.hostname)) {
        throw new DOMException(
          "Cannot retrieve insights for this page as its domain is not whitelisted"
        );
      }
      logger.info("Domain is whitelisted, proceeding...");
    }

    logger.info(
      `Retrieving PageSpeed Insights for '${options.url.toString()}'`
    );

    const urls = buildPageSpeedInsightsUrls(options);

    const pageSpeedScores = await Promise.all(
      Object.entries(urls).map(async ([category, url]) => {
        const res = await fetch(url);
        const resJson = await res.json();

        if (!resJson?.lighthouseResult?.categories?.[category]?.score) {
          throw new DOMException(
            `Could not retrieve insights for '${category}' category}`
          );
        }

        let score: number;
        if (category === InsightCategory.PWA) {
          score = calcPWAScore(resJson.lighthouseResult);
        } else {
          const resScore = resJson.lighthouseResult.categories[category].score;
          if (typeof resScore === "number") {
            score = resJson.lighthouseResult.categories[category].score;
          } else {
            throw new DOMException(
              `Score for '${category}' category is not a number}`
            );
          }
        }

        logger.info(
          `Retrieved insights for '${category}' category. Score: ${score}`
        );

        return score;
      })
    );

    const scoresByCategory: Record<InsightCategory, number> =
      pageSpeedScores.reduce((acc, score, i) => {
        acc[options.categories[i]] = score;
        return acc;
      }, {} as Record<string, number>);

    return new Insights(
      scoresByCategory[InsightCategory.PERFORMANCE],
      scoresByCategory[InsightCategory.ACCESSIBILITY],
      scoresByCategory[InsightCategory.BEST_PRACTICES],
      scoresByCategory[InsightCategory.SEO],
      scoresByCategory[InsightCategory.PWA]
    );
  }
}
