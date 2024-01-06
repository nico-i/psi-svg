#!/usr/bin/env node
import { InsightsService, Options, SvgService } from "@domain";
import { validateWordCSVString } from "@util";
import express from "express";

const app = express();

app.get("/", (req, res) => {
  const handleError = (e: unknown) => {
    if (e instanceof DOMException) {
      res.status(400).send(e.message);
    } else {
      res.status(500).send("Internal server error");
    }
  };

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
      typeof req.query.legend !== "string"
    ) {
      throw new DOMException(
        "Invalid legend query parameter type. Expected string"
      );
    }

    const pageSpeedOptions = new Options(
      req.query.url,
      req.query.legend,
      req.query.strategy,
      req.query.categories
    );

    const svgService = new SvgService();

    insightsService
      .getPageSpeedInsights(pageSpeedOptions)
      .then((insights) => {
        res.send(svgService.generateInsightsSvg(insights, pageSpeedOptions));
      })
      .catch((e) => {
        handleError(e);
      });
  } catch (e) {
    handleError(e);
  }
});

export { app };
