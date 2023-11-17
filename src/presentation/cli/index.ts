#!/usr/bin/env node
import { InsightsService } from "@domain/services/insights-service";
import { SvgService } from "@domain/services/svg-service";
import { Options } from "@domain/valueobjects/options";

const yargs = require("yargs");

// Define the command line options
const cliFlags = yargs
  .usage("Usage: $0 <url> <output-dir> [options]")
  .positional("url", {
    describe: "The URL to fetch insights for",
    type: "string",
  })
  .positional("output", {
    describe: "The path to the output directory to save the final SVG file",
    type: "string",
  })
  .option("legend", {
    alias: "l",
    describe: "Whether to show the legend in the SVG",
    type: "boolean",
  })
  .option("strategy", {
    alias: "s",
    describe: "The platform to use when analyzing the page",
    choices: ["mobile", "desktop"],
    default: "mobile",
    type: "string",
  })
  .option("categories", {
    alias: "c",
    describe: "The categories of insights to fetch",
    type: "string",
  })

  .help("h")
  .alias("h", "help").argv;

const [url, outputDir] = cliFlags._;
if (!url || !outputDir) {
  console.error("Both URL and output path are required.");
  process.exit(1);
}

const insightService = new InsightsService();
const svgService = new SvgService(outputDir);

const options = new Options(
  url,
  cliFlags.legend,
  cliFlags.strategy,
  cliFlags.categories
);

console.log(`Options: ${JSON.stringify(options)}`);

insightService.getPageSpeedInsights(options).then((insights) => {
  svgService.generateInsightsSvg(insights, options.getShowLegend());
  console.log(
    `Successfully generated insights SVG in directory '${outputDir}'`
  );
});
