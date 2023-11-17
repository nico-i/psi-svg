import { InsightsService } from "@domain/services/insights-service";
import { SvgService } from "@domain/services/svg-service";
import { Options } from "@domain/valueobjects/options";
import { validateWordCSVString } from "@util/helper";
import express from "express";
const yargs = require("yargs");

const app = express();

const cliFlags = yargs
  .usage("Usage: $0 [options]")
  .option("port", {
    alias: "p",
    describe: "The port to start the server on",
    default: 3000,
    type: "number",
  })
  .help("h")
  .alias("h", "help").argv;

app.get("/", (req, res) => {
  console.log("Received request");

  let insightsService;

  if (process.env.DOMAIN_WHITELIST) {
    if (validateWordCSVString(process.env.DOMAIN_WHITELIST) === false) {
      throw new DOMException(
        "Invalid DOMAIN_WHITELIST format. Expected comma separated values"
      );
    }
    insightsService = new InsightsService(
      process.env.DOMAIN_WHITELIST.split(",")
    );
  } else {
    insightsService = new InsightsService();
  }

  try {
    if (!req.query.url) {
      throw new DOMException("Missing url query parameter");
    }
    if (typeof req.query.url !== "string") {
      throw new DOMException(
        "Invalid url query parameter type. Expected string"
      );
    }
    if (
      typeof req.query.strategy !== "undefined" &&
      typeof req.query.strategy !== "string"
    ) {
      throw new DOMException(
        "Invalid strategy query parameter type. Expected string"
      );
    }
    if (
      typeof req.query.categories !== "undefined" &&
      typeof req.query.categories !== "string"
    ) {
      throw new DOMException(
        "Invalid categories query parameter type. Expected string"
      );
    }
    if (
      typeof req.query.legend !== "undefined" &&
      typeof req.query.legend !== "boolean"
    ) {
      throw new DOMException(
        "Invalid showLegend query parameter type. Expected boolean"
      );
    }

    const pageSpeedOptions = new Options(
      req.query.url,
      req.query.legend,
      req.query.strategy,
      req.query.categories
    );

    const svgService = new SvgService();

    insightsService.getPageSpeedInsights(pageSpeedOptions).then((insights) => {
      res.send(
        svgService.generateInsightsSvg(
          insights,
          pageSpeedOptions.getShowLegend()
        )
      );
    });
  } catch (e) {
    if (e instanceof DOMException) {
      res.status(400).send(e.message);
    } else {
      res.status(500).send("Internal server error");
    }
  }
});

app.listen(cliFlags.port, () => {
  console.log(`Server started. Listening on port ${cliFlags.port}`);
});
