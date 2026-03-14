# API Reference

## `SearchEngineParser`

The main class. Import and instantiate once, call `parse()` as many times as needed.

```typescript
import { SearchEngineParser } from "parse-search-engine";
const scraper = new SearchEngineParser();
```

### `scraper.parse(html, options?)`

Parses a search engine results page and returns a string.

```typescript
scraper.parse(html: string, options?: ParseOptions): string
```

**`ParseOptions`**

```typescript
interface ParseOptions {
  engine?: "google" | "bing" | "duckduckgo"; // override auto-detection
  outputFormat?: "json" | "markdown";         // default: "json"
}
```

**Returns:** JSON string or Markdown string depending on `outputFormat`.

**Throws:** `Error` when `engine` is not specified and the search engine cannot be detected (confidence below 30%).

---

## `detect(html)`

Low-level detection. Returns the best-matching parser or `null`.

```typescript
import { detect } from "parse-search-engine";

const result = detect(html);
// result: { engine: "google", parser: GoogleParser, confidence: 0.9 } | null
```

**`DetectionResult`**

```typescript
interface DetectionResult {
  engine: EngineName;      // "google" | "bing" | "duckduckgo"
  parser: BaseParser;
  confidence: number;      // 0.0 – 1.0
}
```

---

## `getParserForEngine(engine)`

Returns a parser instance for the specified engine.

```typescript
import { getParserForEngine } from "parse-search-engine";

const parser = getParserForEngine("bing");
const results = parser.parse(html); // returns SearchResults object
```

---

## `formatJSON(results)` / `formatMarkdown(results)`

Low-level formatters. Accept a `SearchResults` object and return a string.

```typescript
import { getParserForEngine, formatJSON, formatMarkdown } from "parse-search-engine";

const results = getParserForEngine("google").parse(html);
const json = formatJSON(results);
const md   = formatMarkdown(results);
```

---

## Types

### `SearchResults`

```typescript
interface SearchResults {
  search_engine: string;                  // "google" | "bing" | "duckduckgo"
  query: string | null;                   // extracted search query
  total_results: number | null;           // result count (from page if available)
  results: SearchResult[];
  detection_confidence: number;           // 0.0 – 1.0
  parsed_at: string;                      // ISO 8601 timestamp
  metadata: Record<string, unknown>;      // engine-specific extras
}
```

### `SearchResult`

```typescript
interface SearchResult {
  title: string;
  url: string;
  description: string | null;
  position: number;                       // 1-based; 0 for featured snippets
  result_type: ResultType;
  metadata: Record<string, unknown>;
}
```

### `ResultType`

```typescript
type ResultType =
  | "organic"
  | "featured_snippet"
  | "knowledge_panel"
  | "news"
  | "image"
  | "sponsored"
  | "ai_overview"
  | "people_also_ask"
  | "people_saying"
  | "people_also_search"
  | "related_products";
```

### `BaseParser`

```typescript
interface BaseParser {
  readonly engineName: EngineName;
  parse(html: string): SearchResults;
  canParse($: CheerioAPI): number;       // returns confidence 0.0–1.0
  extractQuery($: CheerioAPI): string | null;
}
```
