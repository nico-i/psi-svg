import { Options } from "@domain";
import { describe } from "node:test";

describe("Options", () => {
  it("should throw an error when the url is invalid", () => {
    expect(() => {
      new Options("invalid url");
    }).toThrow();
  });

  it("should throw an error when the showLegend parameter is invalid", () => {
    expect(() => {
      new Options("https://www.google.com", "invalid showLegend");
    }).toThrow();
  });

  it("should throw an error when the strategy parameter is invalid", () => {
    expect(() => {
      new Options("https://www.google.com", "true", "invalid strategy");
    }).toThrow();
  });

  it("should throw an error when the categories parameter is invalid", () => {
    expect(() => {
      new Options(
        "https://www.google.com",
        "true",
        "mobile",
        "invalid categories"
      );
    }).toThrow();
  });

  it("should throw an error when the category does not exist", () => {
    expect(() => {
      new Options(
        "https://www.google.com",
        "true",
        "mobile",
        "performance,invalidCategory"
      );
    }).toThrow();
  });

  it("should return categories as a csv", () => {
    const options = new Options(
      "https://www.google.com",
      "true",
      "mobile",
      "performance,accessibility"
    );

    expect(options.categoriesAsCSVString.split(",")).toEqual([
      "performance",
      "accessibility",
    ]);
  });
});
