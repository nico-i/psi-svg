import { validateWordCSVString } from "@util/helper";

export class Options {
  private url: URL;
  private showLegend: boolean;
  private strategy: InsightStrategy;
  private categories: InsightCategory[];

  constructor(
    url: string,
    showLegend?: boolean,
    strategy?: string,
    categories?: string
  ) {
    this.showLegend = true;
    this.strategy = InsightStrategy.MOBILE;
    this.categories = Object.values(InsightCategory);
    // url validation
    try {
      this.url = new URL(url);
    } catch (e) {
      throw new DOMException(
        "Could not parse url query parameter to URL object"
      );
    }

    if (showLegend !== undefined) {
      this.showLegend = showLegend;
    }

    // strategy validation
    if (strategy !== undefined) {
      if (
        !Object.values(InsightStrategy).includes(strategy as InsightStrategy)
      ) {
        throw new DOMException(`Invalid strategy: ${strategy}`);
      }

      this.strategy = strategy as InsightStrategy;
    }

    // categories validation
    if (categories !== undefined) {
      if (validateWordCSVString(categories) === false) {
        throw new DOMException(
          "Invalid categories query parameter format. Expected comma separated values"
        );
      }
      const categoriesSplit = categories.split(",");
      categoriesSplit.forEach((category: string) => {
        if (
          !Object.values(InsightCategory).includes(category as InsightCategory)
        ) {
          throw new DOMException(`Invalid category: ${category}`);
        }
      });

      this.categories = categoriesSplit as InsightCategory[];
    }
  }

  public getUrlAsString = (): string => this.url.toString();
  public getUrl = (): URL => this.url;

  public getShowLegend = (): boolean => this.showLegend;

  public getStrategy = (): InsightStrategy => this.strategy;

  public getCategoriesAsCSVString = (): string => this.categories.join(",");
  public getCategories = (): InsightCategory[] => this.categories;
}

export enum InsightStrategy {
  MOBILE = "mobile",
  DESKTOP = "desktop",
}

export enum InsightCategory {
  PERFORMANCE = "performance",
  ACCESSIBILITY = "accessibility",
  BEST_PRACTICES = "best-practices",
  SEO = "seo",
  PWA = "pwa",
}

export function getInsightCategoryText(category: InsightCategory): string {
  switch (category) {
    case InsightCategory.PERFORMANCE:
      return "Performance";
    case InsightCategory.ACCESSIBILITY:
      return "Accessibility";
    case InsightCategory.BEST_PRACTICES:
      return "Best Practices";
    case InsightCategory.SEO:
      return "SEO";
    case InsightCategory.PWA:
      return "PWA";
  }
}
