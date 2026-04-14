import {chromium, type Page} from 'playwright';

async function acceptCookies(page: Page): Promise<void>{
    const allowButton = page.locator('[data-test-id="allow-button"]');
    try {
        await allowButton.waitFor({ state: 'visible', timeout: 3000 });
        await allowButton.click();
    } catch {
        console.debug('Cookie banner not shown');
    }
}

async function setDeliveryAddress(page: Page, city: string){
    const addressInput = page.locator('input[role="combobox"][autocomplete="shipping street-address"]');
    await addressInput.fill(city);
    await page.getByRole('option', {name: new RegExp(city, 'i')}).first().click();
}


async function scrapeWolt(city: string){
    const browser = await chromium.launch({headless: false});
    try{
        const context = await browser.newContext({
            geolocation: {longitude: 0, latitude: 0}, //gps reset
            permissions: [], //disallow location access
        });

        const page = await context.newPage();

        const responsePromise = page.waitForResponse((response) => {
            return(
                response.url().includes('consumer-api.wolt.com/v1/pages/front') &&
                response.status() === 200 &&
                (response.headers()['content-type']?.includes('application/json') ?? false)
            )
        });

        await page.goto('https://wolt.com');
        await acceptCookies(page);
        await setDeliveryAddress(page, city);

        const response = await responsePromise;
        return await response.json();
    } finally{
        await browser.close();
    }
}

scrapeWolt('Gdańsk').then(console.log).catch(console.error);