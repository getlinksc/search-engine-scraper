# Contributing

Thanks for your interest in contributing!

## Setup

```bash
git clone https://github.com/getlinksc/parse-search-engine.git
cd parse-search-engine
npm install
```

## Development commands

```bash
npm test              # run all tests
npm run test:coverage # run tests with coverage report
npm run build         # compile TypeScript
```

## Adding a parser

See [docs/adding-a-parser.md](docs/adding-a-parser.md) for a step-by-step guide.

## Guidelines

- **Keep it simple.** No new output formats — JSON and Markdown only.
- **Graceful failures.** Parsers must never throw. Return empty results on bad input.
- **Tests required.** New parsers need unit tests using real HTML fixtures.
- **No HTTP requests.** The library only parses HTML — users provide it.
- **Stable selectors preferred.** Use `id` and `data-*` attributes over class names when possible.

## Pull request checklist

- [ ] Tests pass: `npm test`
- [ ] Coverage stays above 90%: `npm run test:coverage`
- [ ] TypeScript compiles cleanly: `npm run build`
- [ ] HTML fixtures are anonymized (no personal data)
