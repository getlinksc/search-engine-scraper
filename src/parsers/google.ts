import * as cheerio from "cheerio/slim";
import type { CheerioAPI } from "cheerio/slim";
import type { Element } from "domhandler";
import type { BaseParser } from "./base";
import type { SearchResult, SearchResults, EngineName } from "../types";

export class GoogleParser implements BaseParser {
  readonly engineName: EngineName = "google";

  canParse($: CheerioAPI): number {
    let confidence = 0;

    // Check og:site_name meta tag
    const ogSiteName = $('meta[property="og:site_name"]').attr("content");
    if (ogSiteName === "Google") confidence += 0.5;

    // Check schema.org SearchResultsPage
    if ($('html[itemtype*="schema.org/SearchResultsPage"]').length > 0) confidence += 0.3;

    // Check title for "Google Search"
    const title = $("title").text();
    if (/google\s*search/i.test(title)) confidence += 0.3;

    // Check for JS-required pages
    if (/enable javascript|turn on javascript/i.test(title)) confidence += 0.3;

    // Check for Google-specific DOM patterns
    if ($("#search").length > 0) confidence += 0.1;
    if ($("div.g").length > 0 || $("div.MjjYud").length > 0) confidence += 0.1;

    return Math.min(confidence, 1);
  }

  extractQuery($: CheerioAPI): string | null {
    // Try input[name=q]
    const q = $('input[name="q"]').attr("value");
    if (q) return q;

    // Try title - Google usually has "query - Google Search"
    const title = $("title").text();
    const match = title.match(/^(.+?)\s*[-–]\s*Google/);
    if (match) return match[1].trim();

    return null;
  }

  parse(html: string): SearchResults {
    const $ = cheerio.load(html);
    const confidence = this.canParse($);
    const query = this.extractQuery($);
    const results: SearchResult[] = [];
    let position = 1;

    // Check for JS-required error page
    const title = $("title").text();
    if (
      title.includes("Turn on JavaScript") ||
      title.includes("Enable JavaScript")
    ) {
      return {
        search_engine: this.engineName,
        query,
        total_results: 0,
        results: [],
        detection_confidence: confidence,
        parsed_at: new Date().toISOString(),
        metadata: { error: "javascript_required" },
      };
    }

    // Try featured snippets first (position 0)
    this.extractFeaturedSnippets($, results);

    // Try modern format (MjjYud containers)
    const modernResults = $("div.MjjYud");
    if (modernResults.length > 0) {
      modernResults.each((_, el) => {
        const result = this.parseModernResult($, el);
        if (result) {
          result.position = position++;
          results.push(result);
        }
      });
    } else {
      // Legacy format (div.g containers)
      $("div.g").each((_, el) => {
        const result = this.parseLegacyResult($, el);
        if (result) {
          result.position = position++;
          results.push(result);
        }
      });
    }

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

  private extractFeaturedSnippets($: CheerioAPI, results: SearchResult[]): void {
    $("div.xpdopen").each((_, el) => {
      const snippetText = $(el).find("span.hgKElc").text().trim();
      const link = $(el).find("a");
      const url = link.attr("href") || "";
      const title = link.find("h3").text().trim() || link.text().trim();

      if (snippetText && title) {
        results.push({
          title,
          url,
          description: snippetText,
          position: 0,
          result_type: "featured_snippet",
          metadata: { snippet_type: "paragraph" },
        });
      }
    });
  }

  private parseModernResult($: CheerioAPI, el: Element): SearchResult | null {
    const $el = $(el);

    // Find title via h3.LC20lb or fall back to any h3 inside yuRUbf
    const titleEl = $el.find("h3.LC20lb").first();
    const title = titleEl.length > 0
      ? titleEl.text().trim()
      : $el.find("div.yuRUbf h3").first().text().trim();

    if (!title) return null;

    // Find URL
    const linkEl = $el.find("div.yuRUbf a").first();
    const url = linkEl.attr("href") || "";
    if (!url) return null;

    // Find description - try multiple selectors
    let description: string | null = null;
    const descSelectors = [
      "div.VwiC3b",
      "div.notranslate.ESMNde",
      "div.q0vns",
      "div.byrV5b",
      "div.iTPLzd",
      "div.CA5RN",
      "div.VuuXrf",
    ];

    for (const sel of descSelectors) {
      const descEl = $el.find(sel).first();
      if (descEl.length > 0) {
        description = descEl.text().trim() || null;
        if (description) break;
      }
    }

    return {
      title,
      url,
      description,
      position: 0, // set by caller
      result_type: "organic",
      metadata: {},
    };
  }

  private parseLegacyResult($: CheerioAPI, el: Element): SearchResult | null {
    const $el = $(el);
    const title = $el.find("div.yuRUbf a h3").text().trim();
    const url = $el.find("div.yuRUbf a").attr("href") || "";
    const description = $el.find("div.VwiC3b").text().trim() || null;

    if (!title || !url) return null;

    return {
      title,
      url,
      description,
      position: 0, // set by caller
      result_type: "organic",
      metadata: {},
    };
  }
}
