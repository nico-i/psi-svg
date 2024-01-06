import { Insights, PWAMetricByScore } from "@domain";
import { describe } from "node:test";

describe("Insights", () => {
  it("should convert decimal percentages to integers", () => {
    const percentage = 0.9;
    const insights = new Insights(
      percentage,
      percentage,
      percentage,
      percentage
    );

    expect(insights.performanceScore).toBe(90);
    expect(insights.a11yScore).toBe(90);
    expect(insights.bestPracticesScore).toBe(90);
    expect(insights.seoScore).toBe(90);
  });

  it("should convert PWA scores to PWA metrics", () => {
    const possibleScores: string[] = Object.keys(PWAMetricByScore);

    possibleScores.forEach((score: string) => {
      const insights = new Insights(0, 0, 0, 0, Number(score));
      expect(insights.pwaScore).toBe(PWAMetricByScore[score]);
    });
  });

  it("should throw an error if the PWA score is invalid", () => {
    const wrongPWAScore = 0.5;
    expect(Object.keys(PWAMetricByScore)).not.toContain(wrongPWAScore);
    expect(() => new Insights(0, 0, 0, 0, wrongPWAScore)).toThrow(DOMException);
  });
});
