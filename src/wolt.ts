import {chromium, type Page, type Response} from 'playwright';

async function acceptCookies(page: Page): Promise<void>{
    const allowButton = page.locator('[data-test-id="allow-button"]');
    try {
        await allowButton.waitFor({ state: 'visible', timeout: 3000 });
        await allowButton.click();
    } catch {
        console.debug('Skipping cookie banner interaction');
    }
}

async function setDeliveryAddress(page: Page, city: string){
    const addressInput = page.locator('input[role="combobox"][autocomplete="shipping street-address"]');
    await addressInput.fill(city);
    await page.getByRole('option', {name: new RegExp(escapeRegex(city), 'i')}).first().click();
}

function isWoltFrontResponse(response: Response): boolean{
    return (
        response.url().includes('consumer-api.wolt.com/v1/pages/front') &&
        response.status() === 200 &&
        (response.headers()['content-type']?.includes('application/json') ?? false)
    );
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


export async function scrapeWolt(city: string){
    const browser = await chromium.launch({headless: false});
    try{
        const context = await browser.newContext();

        const page = await context.newPage();

        await page.goto('https://wolt.com');
        await acceptCookies(page);

        const responsePromise = page.waitForResponse(isWoltFrontResponse);
        await setDeliveryAddress(page, city);

        const response = await responsePromise;
        const rawData = await response.json();

        return {
            platform: 'wolt',
            city,
            rawData
        }
    } finally{
        await browser.close();
    }
}
