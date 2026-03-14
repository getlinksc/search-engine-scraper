import * as cheerio from "cheerio/slim";
import type { CheerioAPI } from "cheerio/slim";
import type { BaseParser } from "./base";
import type { SearchResult, SearchResults, EngineName } from "../types";

export class BingParser implements BaseParser {
  readonly engineName: EngineName = "bing";

  canParse($: CheerioAPI): number {
    let confidence = 0;

    const msApp = $('meta[name="ms.application"]').attr("content");
    if (msApp === "Bing") confidence += 0.5;

    if ($("#b_results").length > 0) confidence += 0.3;
    if ($("li.b_algo").length > 0) confidence += 0.2;

    return Math.min(confidence, 1);
  }

  extractQuery($: CheerioAPI): string | null {
    const q = $('input[name="q"]').attr("value");
    if (q) return q;

    const title = $("title").text();
    const match = title.match(/^(.+?)\s*[-–]\s*Bing/);
    if (match) return match[1].trim();

    return null;
  }

  parse(html: string): SearchResults {
    const $ = cheerio.load(html);
    const confidence = this.canParse($);
    const query = this.extractQuery($);
    const results: SearchResult[] = [];
    let position = 1;

    $("li.b_algo").each((_, el) => {
      const $el = $(el);
      const linkEl = $el.find("h2 > a").first();
      const title = linkEl.text().trim();
      const url = linkEl.attr("href") || "";
      const description = $el.find("div.b_caption p").text().trim() || null;

      if (title && url) {
        results.push({
          title,
          url,
          description,
          position: position++,
          result_type: "organic",
          metadata: {},
        });
      }
    });

    return {
      search_engine: this.engineName,
      query,
      total_results: results.length,
      results,
      detection_confidence: confidence,
      parsed_at: new Date().toISOString(),
      metadata: {},
    };
  }
}
