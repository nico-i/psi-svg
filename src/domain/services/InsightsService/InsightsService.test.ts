import { InsightsService, Options } from "@domain";
import fetchMock from "jest-fetch-mock";
import { describe } from "node:test";
import a11yMock from "../../../__mocks__/psi/a11y.json";
import bestPracticesMock from "../../../__mocks__/psi/best-practices.json";
import performanceMock from "../../../__mocks__/psi/performance.json";
import pwaMock from "../../../__mocks__/psi/pwa.json";
import seoMock from "../../../__mocks__/psi/seo.json";

describe("InsightsService", () => {
  fetchMock.enableMocks();

  const domainWhitelist = ["example.com"];
  const insightsService = new InsightsService(domainWhitelist);

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe("getPageSpeedInsights", () => {
    it("should retrieve all insights for a known website", async () => {
      fetchMock
        .once(JSON.stringify(performanceMock))
        .once(JSON.stringify(a11yMock))
        .once(JSON.stringify(bestPracticesMock))
        .once(JSON.stringify(seoMock))
        .once(JSON.stringify(pwaMock));

      const options = new Options("https://example.com");
      const insights = await insightsService.getPageSpeedInsights(options);

      expect(insights.a11yScore).toBeGreaterThan(0);
      expect(insights.bestPracticesScore).toBeGreaterThan(0);
      expect(insights.performanceScore).toBeGreaterThan(0);
      expect(insights.seoScore).toBeGreaterThan(0);
    });

    it("should refuse to retrieve insights for a non-whitelisted hostname", async () => {
      const probes = ["https://example.org", "https://test.example.com/"];
      for (const url of probes) {
        await expect(
          insightsService.getPageSpeedInsights(new Options(url))
        ).rejects.toThrow(DOMException);
      }
    });
  });
});
