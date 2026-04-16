import { writeFile } from 'node:fs/promises';
import { scrapeWolt } from './wolt.js';

const city = process.argv[2] ?? 'Gdańsk';
const query = process.argv[3] ?? 'burger';
const limit = Number.parseInt(process.argv[4] ?? '5', 10) || 5;

scrapeWolt(city, query, limit)
    .then(async (result) => {
        await writeFile('wolt-result.json', JSON.stringify(result, null, 2), 'utf-8');
        console.log('Saved file to wolt-result.json');
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
