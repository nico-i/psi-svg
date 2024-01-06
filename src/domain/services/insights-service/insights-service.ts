import { InsightCategory, Insights, Options } from "@domain";
import { calcPWAScore, logger } from "@util";
require("dotenv").config();

export class InsightsService {
  private domainWhitelist: string[];

  constructor(domainWhitelist?: string[]) {
    this.domainWhitelist = domainWhitelist ?? [];
  }

  async getPageSpeedInsights(options: Options): Promise<Insights> {
    logger.info(
      `Retrieving PageSpeed Insights for '${options.getUrlAsString()}'`
    );
    if (this.domainWhitelist.length > 0) {
      if (!this.domainWhitelist.includes(options.getUrl().hostname)) {
        throw new DOMException(
          "Cannot retrieve insights for this page as its domain is not whitelisted"
        );
      }
      logger.info("Domain is whitelisted, proceeding...");
    }

    const urls = this.buildPageSpeedInsightsUrls(options);

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
          score = resJson.lighthouseResult.categories[category].score ?? -1;
        }

        logger.info(
          `Retrieved insights for '${category}' category. Score: ${score}`
        );

        return score;
      })
    );

    const scoresByCategory = pageSpeedScores.reduce((acc, score, i) => {
      acc[options.getCategories()[i]] = score;
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

  private buildPageSpeedInsightsUrls(options: Options): Record<string, string> {
    const url = new URL(
      "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    );
    url.searchParams.append("url", options.getUrlAsString());
    url.searchParams.append("strategy", options.getStrategy());
    return options.getCategories().reduce((acc, category: string) => {
      url.searchParams.set("category", category);
      acc[category] = url.toString();
      return acc;
    }, {} as Record<string, string>);
  }
}
