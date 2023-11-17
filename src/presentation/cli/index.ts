#!/usr/bin/env npx ts-node -r tsconfig-paths/register
import { InsightsService } from "@domain/services/insights-service";
import { SvgService } from "@domain/services/svg-service";
import { Options } from "@domain/valueobjects/options";
import app from "@presentation/server";
import { logger } from "@util/logger";

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
    describe: "Whether to show the legend in the SVG",
    type: "boolean",
  })
  .option("strategy", {
    describe: "The platform to use when analyzing the page",
    choices: ["mobile", "desktop"],
    default: "mobile",
    type: "string",
  })
  .option("categories", {
    describe: "The categories of insights to fetch",
    type: "string",
  })
  .option("srv", {
    alias: "s",
    describe: "Start the server",
    type: "boolean",
  })
  .option("port", {
    alias: "p",
    describe: "The port to start the server on",
    default: 3000,
    type: "number",
  })

  .help("h")
  .alias("h", "help").argv;

logger.info("Starting PageSpeed Insights CLI...");
logger.info("Parsing command line arguments...");
logger.info(`Command line arguments: ${JSON.stringify(cliFlags)}`);

if (cliFlags.srv) {
  if (cliFlags.srv && cliFlags._.length > 0) {
    logger.error(
      "The only other permitted flag when starting the server is `-p` or `--port`"
    );
    process.exit(1);
  }

  app.listen(cliFlags.port, () => {
    logger.info(`Server started. Listening on port ${cliFlags.port}`);
  });
} else {
  const [url, outputDir] = cliFlags._;
  if (!url || !outputDir) {
    logger.error("Both URL and output path are required.");
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

  insightService
    .getPageSpeedInsights(options)
    .then((insights) => {
      svgService.generateInsightsSvg(insights, options);
      logger.info(
        `Successfully generated insights SVG in directory '${outputDir}'`
      );
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
