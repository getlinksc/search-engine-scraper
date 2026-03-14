import * as cheerio from "cheerio/slim";
import type { BaseParser } from "./parsers/base";
import type { EngineName } from "./types";
import { GoogleParser } from "./parsers/google";
import { BingParser } from "./parsers/bing";
import { DuckDuckGoParser } from "./parsers/duckduckgo";

export interface DetectionResult {
  engine: EngineName;
  parser: BaseParser;
  confidence: number;
}

const parsers: BaseParser[] = [
  new GoogleParser(),
  new BingParser(),
  new DuckDuckGoParser(),
];

export function detect(html: string): DetectionResult | null {
  const $ = cheerio.load(html);
  let best: DetectionResult | null = null;

  for (const parser of parsers) {
    const confidence = parser.canParse($);
    if (confidence > (best?.confidence ?? 0)) {
      best = { engine: parser.engineName, parser, confidence };
    }
  }

  if (best && best.confidence >= 0.3) return best;
  return null;
}

export function getParserForEngine(engine: EngineName): BaseParser {
  const map: Record<EngineName, BaseParser> = {
    google: new GoogleParser(),
    bing: new BingParser(),
    duckduckgo: new DuckDuckGoParser(),
  };
  return map[engine];
}
