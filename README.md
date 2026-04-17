# Cheapest Food Finder

`cheapest_food_finder` is a CLI-based scraping project for extracting and structuring food delivery marketplace data.

The current implementation focuses on **Wolt** and demonstrates:
- browser automation with Playwright
- handling dynamic UI elements such as cookies and delivery address selection
- intercepting search API responses
- fetching venue menu data directly from discovered API endpoints
- transforming raw data into readable output files

## What it does

Given:
- a city
- a search query
- an optional result limit

the scraper:
1. opens Wolt
2. accepts the cookie banner if needed
3. sets the delivery address
4. submits the search query
5. captures the search response
6. extracts the top matching venues
7. fetches each venue's assortment JSON using its slug
8. selects the cheapest qualifying popular menu item
9. saves raw and processed results
10. generates a readable text report

## Repository structure

- `src/app.ts` -- CLI entrypoint and report generation
- `src/wolt.ts` -- Wolt scraping orchestration and file output
- `src/wolt.search.ts` -- search flow and top venue extraction
- `src/wolt.menu.ts` -- venue menu fetching and cheapest item extraction
- `outputs/` -- generated JSON files
- `result.txt` -- generated plain-text report
- `research/` -- screenshots and reverse engineering notes

## Research

The `research/` directory contains screenshots collected while inspecting Wolt traffic and frontend behavior.

It includes screenshots from:
- **Burp Suite**
- **Charles Proxy**

These materials were used during reverse engineering to identify useful requests, understand payload structure, and determine which responses were worth capturing in code.

## Tech stack

- TypeScript
- Node.js
- Playwright

## Output files

After a successful run, the project generates:

- `outputs/wolt-raw-search.json`
- `outputs/wolt-top-venues.json`
- `outputs/wolt-first-menu-raw.json`
- `outputs/wolt-top-venues-with-items.json`
- `result.txt`

## Installation

### Requirements

Make sure you have:
- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Install Playwright browser binaries

```bash
npx playwright install chromium
```

## Usage

Run the scraper with:

```bash
npm run start -- "<city>" "<query>" <limit>
```

Example:

```bash
npm run start -- "Gdańsk" "kebab" 5
```

If `limit` is not provided, the default value is `5`.

Example without explicit limit:

```bash
npm run start -- "Gdańsk" "burger"
```

## Example result

The CLI prints a formatted report and also saves the same content to `result.txt`.

Example structure:

```text
Wolt | Gdańsk | pizza | top 5

1. Felino
   Rating: 8.2
   Delivery Time: ~45 min
   Delivery: 0.00 zł
   Cheapest item: Pizza margherita
   Description: Sos pomidorowy, mozzarella, oliwa, bazylia
   Price: 29.00 zł
   URL: https://wolt.com/en/pol/gdansk/restaurant/felino3c

2. Pizzarium 01
   Rating: 8
   Delivery Time: ~35 min
   Delivery: 0.00 zł
   Cheapest item: Margherita
   Description: Sos pomidorowy, Mozzarella Fior di Latte, bazylia
   Price: 31.00 zł
   URL: https://wolt.com/en/pol/gdansk/restaurant/pizzarium-01

3. Pizza Cat
   Rating: 8.8
   Delivery Time: ~30 min
   Delivery: 0.00 zł
   Cheapest item: Margherita 🌱
   Description: Sos pomidorowy mozzarella
   Price: 31.00 zł
   URL: https://wolt.com/en/pol/gdansk/restaurant/pizza-cat
```

## Notes

- The project currently supports **Wolt only**.
- The selected item is currently based on **popular menu items** from the venue assortment JSON.
- The scraper depends on Wolt's current frontend and API behavior, so selectors or payload handling may require updates if the platform changes.
