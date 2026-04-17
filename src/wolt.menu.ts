import type { Page } from 'playwright';
import type { TopVenue } from './wolt.search.js';

type MenuTag = {
    id?: string,
    label?: string,
};

type MenuItem = {
    name?: string,
    description?: string,
    price?: number,
    tags?: MenuTag[],
};

export type VenueWithCheapestItem = TopVenue & {
    cheapestItemName: string | null,
    cheapestItemDescription: string | null,
    cheapestItemPrice: number | null,
};

function hasPopularTag(item: MenuItem): boolean {
    return (item.tags ?? []).some((tag) => tag.id === 'popular');
}

function pickCheapestPopularMainLikeItem(menuRaw: any): {
    name: string | null,
    description: string | null,
    price: number | null,
} | null {
    const items: MenuItem[] = Array.isArray(menuRaw?.items) ? menuRaw.items : [];

    const candidates = items.filter(
        (item): item is MenuItem & { price: number } =>
            typeof item.price === 'number' &&
            item.price >= 1000 &&
            hasPopularTag(item)
    );

    if (!candidates.length) return null;

    const cheapest = candidates.reduce((min, curr) =>
        curr.price < min.price ? curr : min
    );

    return {
        name: cheapest.name ?? null,
        description: cheapest.description?.trim() ? cheapest.description : "Brak",
        price: cheapest.price,
    };
}

export async function enrichVenuesWithCheapestItems(
    page: Page,
    venues: TopVenue[],
    _query: string
): Promise<{ firstMenuRaw: any | null; venuesWithCheapestItem: VenueWithCheapestItem[] }> {
    let firstMenuRaw: any | null = null;
    const venuesWithCheapestItem: VenueWithCheapestItem[] = [];

    for (const venue of venues) {
        try {
            if (!venue.slug) {
                throw new Error('Missing venue slug');
            }

            const menuUrl = `https://consumer-api.wolt.com/consumer-api/consumer-assortment/v1/venues/slug/${venue.slug}/assortment`;

            const menuResponse = await page.context().request.get(menuUrl, {
                headers: { accept: 'application/json' },
            });

            if (!menuResponse.ok()) {
                throw new Error(`Menu GET failed: HTTP ${menuResponse.status()} for ${venue.slug}`);
            }

            const menuRaw = await menuResponse.json();

            if (firstMenuRaw === null) {
                firstMenuRaw = menuRaw;
            }

            const cheapest = pickCheapestPopularMainLikeItem(menuRaw);

            venuesWithCheapestItem.push({
                ...venue,
                cheapestItemName: cheapest?.name ?? null,
                cheapestItemDescription: cheapest?.description ?? null,
                cheapestItemPrice: cheapest?.price ?? null,
            });
        } catch (error) {
            console.error(`Cheapest item stage failed for ${venue.slug}:`, error);

            venuesWithCheapestItem.push({
                ...venue,
                cheapestItemName: null,
                cheapestItemDescription: null,
                cheapestItemPrice: null,
            });
        }
    }

    return { firstMenuRaw, venuesWithCheapestItem };
}
