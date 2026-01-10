/**
 * API Integration for JSONPlaceholder Photos
 *
 * This module provides functions to fetch photo data from the JSONPlaceholder API
 * and transforms the response to match the application's data structure.
 */

export interface Item {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export interface ItemsSuccessResponse {
  data: Item[];
}

export interface ItemsErrorResponse {
  error: string;
}

export type ItemsResponse = ItemsSuccessResponse | ItemsErrorResponse;

export interface ItemSuccessResponse {
  item: Item;
}

export interface ItemErrorResponse {
  error: string;
}

export type ItemResponse = ItemSuccessResponse | ItemErrorResponse;

// Type guards
export function isItemsSuccess(response: ItemsResponse): response is ItemsSuccessResponse {
  return 'data' in response;
}

export function isItemsError(response: ItemsResponse): response is ItemsErrorResponse {
  return 'error' in response;
}

export function isItemSuccess(response: ItemResponse): response is ItemSuccessResponse {
  return 'item' in response;
}

export function isItemError(response: ItemResponse): response is ItemErrorResponse {
  return 'error' in response;
}

export async function getItems(revalidate: number | undefined): Promise<ItemsResponse> {
  try {
    const url = 'https://jsonplaceholder.typicode.com/photos';
    const config: Partial<RequestInit> = {
      signal: AbortSignal.timeout(30000), // 30 second timeout
    }

    let cacheStrategy = '';
    if(revalidate === Infinity){
      // SSG: cache forever
      config['cache'] = 'force-cache'
      cacheStrategy = 'force-cache (SSG)';
    }
    else if(revalidate && revalidate > 0){
      // ISR: revalidate after N seconds
      config['next'] = { revalidate: revalidate }
      cacheStrategy = `revalidate: ${revalidate}s`;
    }
    else {
      // SSR: no cache
      config['cache'] = 'no-store'
      cacheStrategy = 'no-store (no cache)';
    }

    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Fetching photos from JSONPlaceholder... [${cacheStrategy}]`);
    const response = await fetch(url, config);
    const fetchTime = Date.now() - startTime;

    // Check Next.js cache status from headers
    const cacheStatus = response.headers.get('x-nextjs-cache') || 'UNKNOWN';
    const age = response.headers.get('age');

    console.log(`[${new Date().toISOString()}] Cache Status: ${cacheStatus} | Fetch Time: ${fetchTime}ms${age ? ` | Age: ${age}s` : ''}`);

    if (!response.ok) {
      console.error(`[getItems] HTTP ${response.status}: ${response.statusText}`);
      return { error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const photos = await response.json();

    // Return first 20 photos from JSONPlaceholder API
    const data = {
      data: photos.slice(0, 20).map((photo: any) => ({
        id: photo.id,
        albumId: photo.albumId,
        title: photo.title,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
      }))
    };

    console.log(`[${new Date().toISOString()}] ✓ Fetched ${data.data.length} photos`);

    return data;
  } catch (error) {
    console.error('[getItems] Error:', error);
    return { error: String(error) };
  }
}

export async function getItemById(id: string, revalidate: number | undefined): Promise<ItemResponse> {
  try {
    const url = `https://jsonplaceholder.typicode.com/photos/${id}`;
    const config: Partial<RequestInit> = {
      signal: AbortSignal.timeout(30000), // 30 second timeout
    }

    let cacheStrategy = '';
    if(revalidate === Infinity){
      // SSG: cache forever
      config['cache'] = 'force-cache'
      cacheStrategy = 'force-cache (SSG)';
    }
    else if(revalidate && revalidate > 0){
      // ISR: revalidate after N seconds
      config['next'] = { revalidate: revalidate }
      cacheStrategy = `revalidate: ${revalidate}s`;
    }
    else {
      // SSR: no cache
      config['cache'] = 'no-store'
      cacheStrategy = 'no-store (no cache)';
    }

    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Fetching photo ${id}... [${cacheStrategy}]`);
    const response = await fetch(url, config);
    const fetchTime = Date.now() - startTime;

    // Check Next.js cache status from headers
    const cacheStatus = response.headers.get('x-nextjs-cache') || 'UNKNOWN';
    const age = response.headers.get('age');

    console.log(`[${new Date().toISOString()}] Cache Status: ${cacheStatus} | Fetch Time: ${fetchTime}ms${age ? ` | Age: ${age}s` : ''}`);

    if (!response.ok) {
      console.error(`[getItemById] HTTP ${response.status} for id=${id}`);
      return { error: `Photo not found (${response.status})` };
    }

    const photo = await response.json();

    console.log(`[${new Date().toISOString()}] ✓ Fetched photo id=${id}`);
    return { item: photo };
  } catch (error) {
    console.error(`[getItemById] Error for id=${id}:`, error);
    return { error: String(error) };
  }
}