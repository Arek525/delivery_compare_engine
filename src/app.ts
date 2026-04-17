import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { scrapeWolt } from './wolt.js';
import type { VenueWithCheapestItem } from './wolt.menu.js';

function formatPrice(grosze: number | null): string {
    if (grosze === null) return 'Brak';
    return `${(grosze / 100).toFixed(2)} zł`;
}

function buildReport(city: string, query: string, venues: VenueWithCheapestItem[]): string {
    const lines = [`Wolt | ${city} | ${query} | top ${venues.length}`, ''];

    venues.forEach((venue, index) => {
        lines.push(`${index + 1}. ${venue.title}`);
        lines.push(`   Rating: ${venue.ratingScore ?? 'Brak'}`);
        lines.push(`   Delivery Time: ~${venue.etaMinutes ?? 'Brak'} min`);
        lines.push(`   Delivery: ${formatPrice(venue.deliveryFee)}`);
        lines.push(`   Cheapest item: ${venue.cheapestItemName ?? 'Brak'}`);
        lines.push(`   Description: ${venue.cheapestItemDescription ?? 'Brak'}`);
        lines.push(`   Price: ${formatPrice(venue.cheapestItemPrice)}`);
        lines.push(`   URL: ${venue.url}`);
        lines.push('');
    });

    return lines.join('\n');
}

const city = process.argv[2] ?? 'Gdańsk';
const query = process.argv[3] ?? 'burger';
const limit = Number.parseInt(process.argv[4] ?? '5', 10) || 5;

scrapeWolt(city, query, limit)
    .then(async (result) => {
        const report = buildReport(result.city, result.query, result.topVenues);
        const resultPath = join(process.cwd(), 'result.txt');

        await writeFile(resultPath, report, 'utf-8');

        console.log(report);
        console.log(`Saved text report to ${resultPath}`);
        console.log('Done. Files saved.');
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
