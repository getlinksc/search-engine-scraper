# Changelog

## [0.0.1] - 2026-03-14

Initial release of `parse-search-engine`.

### Features

- **Auto-detection** — automatically identifies Google, Bing, and DuckDuckGo from raw HTML
- **Google parser** — supports legacy (`div.g`) and modern (`div.MjjYud`) result formats, featured snippets, and graceful handling of JS-blocked pages
- **Bing parser** — extracts organic results from `li.b_algo` structure
- **DuckDuckGo parser** — extracts organic results using semantic `article[data-testid]` structure
- **JSON output** (default) — structured results with title, url, description, position, result_type, and metadata
- **Markdown output** — LLM-friendly format with sections for featured snippets, organic results, and other result types
- **TypeScript** — full type definitions included, strict mode, Node 18+

### API

```typescript
const scraper = new SearchEngineParser();

scraper.parse(html);                              // JSON (default)
scraper.parse(html, { outputFormat: "markdown" }) // Markdown
scraper.parse(html, { engine: "google" })         // force engine
```

### Supported result types

`organic`, `featured_snippet`, `knowledge_panel`, `news`, `image`, `sponsored`, `ai_overview`, `people_also_ask`, `people_saying`, `people_also_search`, `related_products`
