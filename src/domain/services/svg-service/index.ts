import { Insights, PWAMetric } from "@domain/valueobjects/insights";
import {
  InsightCategory,
  getInsightCategoryText,
} from "@domain/valueobjects/options";
const { JSDOM } = require("jsdom");
const fs = require("fs");

export class SvgService {
  private outputDir: string | undefined;

  constructor(outputPath?: string) {
    if (outputPath) {
      this.outputDir = outputPath;
    }
  }

  public generateInsightsSvg(insights: Insights): string {
    const numericScores = insights.getNumericScoresByCategory();
    const baseXOffset =
      500 -
      (Object.values(numericScores).length +
        (insights.getPWAScore() ? 1 : 0)) *
        100;
    // Load base SVG
    const baseSvg = fs.readFileSync("./assets/img/vector/base.svg", "utf8");
    const dom = new JSDOM(baseSvg, { contentType: "image/svg+xml" });
    const { document } = dom.window;
    const baseSvgElement = document.querySelector("svg");
    // Add CSS
    const baseStyle = fs.readFileSync("./assets/css/style.css", "utf8");
    const baseStyleElement = dom.window.document.createElement("style");
    baseStyleElement.textContent = baseStyle;
    baseSvgElement.innerHTML += baseStyleElement.outerHTML;

    // Add gauges
    const gaugeSVGs: string[] = [];
    Object.entries(numericScores).forEach(([category, score], i) => {
      gaugeSVGs.push(
        this.getGaugeSvg(
          category as InsightCategory,
          score,
          baseXOffset + i * 200
        )
      );
    });
    const pwaScore = insights.getPWAScore();
    if (pwaScore) {
      gaugeSVGs.push(
        this.getPWASvg(
          pwaScore,
          baseXOffset + Object.values(numericScores).length * 200
        )
      );
    }
    gaugeSVGs.forEach((metricSvg) => {
      baseSvgElement.innerHTML += metricSvg;
    });
    // Write to file if applicable
    if (this.outputDir) {
      fs.writeFileSync(
        `${this.outputDir}/insights.svg`,
        baseSvgElement.outerHTML
      );
    }

    return baseSvgElement.outerHTML;
  }

  private getGaugeCssClass(score: number): string {
    if (score >= 90) {
      return "guage-green";
    } else if (score >= 50) {
      return "guage-orange";
    } else if (score >= 0) {
      return "guage-red";
    }
    return "guage-undefined";
  }

  private getGaugeSvg(
    category: InsightCategory,
    score: number,
    xOffset: number
  ): string {
    const gaugeSvg = fs.readFileSync("./assets/img/vector/gauge.svg", "utf8");
    const gaugeDom = new JSDOM(gaugeSvg, { contentType: "image/svg+xml" });
    const { document: gaugeDocument } = gaugeDom.window;

    const gaugeSVGElement = gaugeDocument.querySelector("svg");
    const gaugeClass = this.getGaugeCssClass(score);
    gaugeSVGElement.setAttribute(
      "class",
      `${gaugeSVGElement.getAttribute("class")} ${gaugeClass}`
    );
    gaugeSVGElement.setAttribute("x", xOffset);

    const scoreTextElement = gaugeDocument.querySelector("#score");
    scoreTextElement.textContent = score.toString();

    const categoryTextElement = gaugeDocument.querySelector("#category");
    categoryTextElement.textContent = getInsightCategoryText(category);

    const scoreCircleElement = gaugeDocument.querySelector("#score-circle");
    scoreCircleElement.setAttribute(
      "stroke-dasharray",
      (score * 351.858) / 100
    );

    return gaugeSVGElement.outerHTML;
  }

  private getPWASvg(score: PWAMetric, xOffset: number): string {
    let pwaSvgFileName;
    switch (score) {
      case PWAMetric.NA:
        pwaSvgFileName = "na.svg";
        break;
      case PWAMetric.RELIABLE:
        pwaSvgFileName = "reliable.svg";
        break;
      case PWAMetric.INSTALLABLE:
        pwaSvgFileName = "installable.svg";
        break;
      case PWAMetric.OPTIMIZED:
        pwaSvgFileName = "optimized.svg";
        break;
      case PWAMetric.ALL:
        pwaSvgFileName = "all.svg";
        break;
    }

    const pwaSvg = fs.readFileSync(
      `./assets/img/vector/pwa/${pwaSvgFileName}`,
      "utf8"
    );
    const pwaDom = new JSDOM(pwaSvg, { contentType: "image/svg+xml" });
    const { document: pwaDocument } = pwaDom.window;

    const pwaSVGElement = pwaDocument.querySelector("svg");
    pwaSVGElement.setAttribute("x", xOffset);

    return pwaSVGElement.outerHTML;
  }
}
