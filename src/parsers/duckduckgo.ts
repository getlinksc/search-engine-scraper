import * as cheerio from "cheerio/slim";
import type { CheerioAPI } from "cheerio/slim";
import type { BaseParser } from "./base";
import type { SearchResult, SearchResults, EngineName } from "../types";

export class DuckDuckGoParser implements BaseParser {
  readonly engineName: EngineName = "duckduckgo";

  canParse($: CheerioAPI): number {
    let confidence = 0;

    const desc = $('meta[name="description"]').attr("content");
    if (desc && desc.toLowerCase().includes("duckduckgo")) confidence += 0.4;

    const canonical = $('link[rel="canonical"]').attr("href");
    if (canonical && canonical.includes("duckduckgo.com")) confidence += 0.4;

    if ($("#links").length > 0) confidence += 0.1;
    if ($('article[data-testid="result"]').length > 0) confidence += 0.1;

    return Math.min(confidence, 1);
  }

  extractQuery($: CheerioAPI): string | null {
    const q = $('input[name="q"]').attr("value");
    if (q) return q;

    const canonical = $('link[rel="canonical"]').attr("href");
    if (canonical) {
      try {
        const url = new URL(canonical);
        const query = url.searchParams.get("q");
        if (query) return query;
      } catch {
        // ignore invalid URL
      }
    }

    return null;
  }

  parse(html: string): SearchResults {
    const $ = cheerio.load(html);
    const confidence = this.canParse($);
    const query = this.extractQuery($);
    const results: SearchResult[] = [];
    let position = 1;

    $('article[data-testid="result"]').each((_, el) => {
      const $el = $(el);
      const linkEl = $el.find("h2 > a").first();
      const title = linkEl.text().trim();
      const url = linkEl.attr("href") || "";
      const description =
        $el.find('span[data-testid="result-snippet"]').text().trim() || null;

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
