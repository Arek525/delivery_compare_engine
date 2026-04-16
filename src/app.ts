import { scrapeWolt } from './wolt.js';

const city = process.argv[2] ?? 'Gdańsk';
const query = process.argv[3] ?? 'burger';
const limit = Number.parseInt(process.argv[4] ?? '5', 10) || 5;

scrapeWolt(city, query, limit)
    .then((result) => {
        console.log('Done. Files saved.');
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
