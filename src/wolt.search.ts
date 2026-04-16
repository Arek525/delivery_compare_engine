import {chromium, type Page, type Response} from 'playwright';

export type TopVenue = {
    title: string,
    slug: string | null,
    url: string,
    deliveryFee: number | null,
    etaMinutes: number | null,
    ratingScore: number | null
};

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

async function searchQuery(page: Page, query: string){
    const queryInput = page.locator('input[data-test-id="SearchInput"]');
    await queryInput.fill(query);
    await queryInput.press('Enter');
}

function isWoltSearchResponse(response: Response): boolean{
    return (
        response.url().includes('restaurant-api.wolt.com/v1/pages/search') &&
        response.request().method() === 'POST' &&
        response.status() === 200 &&
        (response.headers()['content-type']?.includes('application/json') ?? false)
    );
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractTopVenues(rawData: any, limit: number): TopVenue[] {
    const items = (rawData?.sections ?? [])
        .flatMap((s: any) => s?.items ?? [])
        .filter((i: any) => i?.template === 'venue' && i?.link?.target && i?.venue);

    return items.slice(0, limit).map((i: any) => ({
        title: i.title ?? i.venue.name ?? 'Unknown',
        slug: i.venue?.slug ?? 'Unknown',
        url: i.link.target,
        deliveryFee: i.venue.delivery_price_int ?? null,
        etaMinutes: i.venue.estimate ?? null,
        ratingScore: i.venue.rating?.score ?? null,
    }));
}

export async function runSearchStage(
    page: Page,
    city: string,
    query: string,
    limit: number
) : Promise<{ rawData: any; topVenues: TopVenue[] }> {
    await page.goto('https://wolt.com');
    await acceptCookies(page);
    await setDeliveryAddress(page, city);

    const responsePromise = page.waitForResponse((response) => isWoltSearchResponse(response));
    await searchQuery(page, query);

    const response = await responsePromise;
    const rawData = await response.json();
    const topVenues = extractTopVenues(rawData, limit);

    return { rawData, topVenues };
}