import { validateWordCSVString } from "@util";

export class Options {
  private _url: URL;
  private _showLegend: boolean;
  private _strategy: InsightStrategy;
  private _categories: InsightCategory[];

  constructor(
    url: string,
    showLegend?: string,
    strategy?: string,
    categories?: string
  ) {
    this._showLegend = true;
    this._strategy = InsightStrategy.MOBILE;
    this._categories = Object.values(InsightCategory);
    // url validation
    try {
      this._url = new URL(url);
    } catch (e) {
      throw new DOMException(
        "Could not parse url query parameter to URL object"
      );
    }

    if (showLegend !== undefined) {
      try {
        this._showLegend = JSON.parse(showLegend);
      } catch (e) {
        throw new DOMException(
          "Failed to parse legend query parameter to boolean"
        );
      }
    }

    // strategy validation
    if (strategy !== undefined) {
      if (
        !Object.values(InsightStrategy).includes(strategy as InsightStrategy)
      ) {
        throw new DOMException(`Invalid strategy: ${strategy}`);
      }

      this._strategy = strategy as InsightStrategy;
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

      this._categories = categoriesSplit as InsightCategory[];
    }
  }
  get showLegend(): boolean {
    return this._showLegend;
  }

  get strategy(): InsightStrategy {
    return this._strategy;
  }

  get categories(): InsightCategory[] {
    return this._categories;
  }

  get url(): URL {
    return this._url;
  }

  get categoriesAsCSVString(): string {
    return this._categories.join(",");
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
