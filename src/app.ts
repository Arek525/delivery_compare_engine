import { scrapeWolt } from './wolt.js';

const city = process.argv[2] ?? 'Gdańsk';

scrapeWolt(city)
    .then((result) => {
        console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
