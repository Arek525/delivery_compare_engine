import {chromium} from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { runSearchStage } from './wolt.search.js';
import { enrichVenuesWithCheapestItems } from './wolt.menu.js';


async function saveJsonToOutputs(fileName: string, data: unknown): Promise<string> {
    const outputDir = join(process.cwd(), 'outputs');
    await mkdir(outputDir, { recursive: true });

    const filePath = join(outputDir, fileName);
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return filePath;
}


export async function scrapeWolt(city: string, query: string, limit: number){
    const browser = await chromium.launch({headless: false});
    try{
        const context = await browser.newContext();
        const page = await context.newPage();

        const { rawData, topVenues } = await runSearchStage(page, city, query, limit);

        const { firstMenuRaw, venuesWithCheapestItem } =
            await enrichVenuesWithCheapestItems(page, topVenues, query);

        await saveJsonToOutputs('wolt-raw-search.json', rawData);
        await saveJsonToOutputs('wolt-top-venues.json', topVenues);
        await saveJsonToOutputs('wolt-first-menu-raw.json', firstMenuRaw);
        await saveJsonToOutputs('wolt-top-venues-with-items.json', venuesWithCheapestItem);


    return { platform: 'wolt', city, query, topVenues: venuesWithCheapestItem };

    } finally{
        await browser.close();
    }
}
