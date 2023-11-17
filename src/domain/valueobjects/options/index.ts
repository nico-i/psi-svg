import { validateWordCSVString } from "@util/helper";

export class Options {
  private url: URL;
  private strategy: InsightStrategy = InsightStrategy.MOBILE;
  private categories: InsightCategory[] = Object.values(InsightCategory);

  constructor(url: string, strategy?: string, categories?: string) {
    // url validation
    try {
      this.url = new URL(url);
    } catch (e) {
      throw new DOMException(
        "Could not parse url query parameter to URL object"
      );
    }

    // categories validation
    if (categories) {
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

    // strategy validation
    if (strategy) {
      if (
        !Object.values(InsightStrategy).includes(strategy as InsightStrategy)
      ) {
        throw new DOMException(`Invalid strategy: ${strategy}`);
      }

      this.strategy = strategy as InsightStrategy;
    }
  }

  public getUrlAsString(): string {
    return this.url.toString();
  }

  public getUrl(): URL {
    return this.url;
  }

  public getStrategy(): string {
    return this.strategy;
  }

  public getCategoriesAsCSVString(): string {
    return this.categories?.join(",");
  }

  public getCategories(): string[] {
    return this.categories;
  }
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
