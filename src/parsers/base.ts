import type { CheerioAPI } from "cheerio/slim";
import type { SearchResults, EngineName } from "../types";

export interface BaseParser {
  readonly engineName: EngineName;
  parse(html: string): SearchResults;
  canParse($: CheerioAPI): number;
  extractQuery($: CheerioAPI): string | null;
}
