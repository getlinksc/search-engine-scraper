import * as cheerio from "cheerio/slim";
import { GoogleParser } from "../../src/parsers/google";
import { BingParser } from "../../src/parsers/bing";
import { DuckDuckGoParser } from "../../src/parsers/duckduckgo";

describe("query extraction", () => {
  describe("GoogleParser.extractQuery", () => {
    const parser = new GoogleParser();

    test("extracts from input[name=q]", () => {
      const $ = cheerio.load('<input name="q" value="test query">');
      expect(parser.extractQuery($)).toBe("test query");
    });

    test("extracts from title", () => {
      const $ = cheerio.load("<title>my search - Google Search</title>");
      expect(parser.extractQuery($)).toBe("my search");
    });

    test("returns null when no query found", () => {
      const $ = cheerio.load("<html><body></body></html>");
      expect(parser.extractQuery($)).toBeNull();
    });
  });

  describe("BingParser.extractQuery", () => {
    const parser = new BingParser();

    test("extracts from input[name=q]", () => {
      const $ = cheerio.load('<input name="q" value="bing query">');
      expect(parser.extractQuery($)).toBe("bing query");
    });

    test("extracts from title", () => {
      const $ = cheerio.load("<title>test - Bing</title>");
      expect(parser.extractQuery($)).toBe("test");
    });

    test("returns null when no query found", () => {
      const $ = cheerio.load("<html></html>");
      expect(parser.extractQuery($)).toBeNull();
    });
  });

  describe("DuckDuckGoParser.extractQuery", () => {
    const parser = new DuckDuckGoParser();

    test("extracts from input[name=q]", () => {
      const $ = cheerio.load('<input name="q" value="ddg query">');
      expect(parser.extractQuery($)).toBe("ddg query");
    });

    test("extracts from canonical URL", () => {
      const $ = cheerio.load(
        '<link rel="canonical" href="https://duckduckgo.com/?q=my+search">'
      );
      expect(parser.extractQuery($)).toBe("my search");
    });

    test("returns null for invalid canonical URL", () => {
      const $ = cheerio.load('<link rel="canonical" href="not a url">');
      expect(parser.extractQuery($)).toBeNull();
    });

    test("returns null when no query found", () => {
      const $ = cheerio.load("<html></html>");
      expect(parser.extractQuery($)).toBeNull();
    });
  });
});
