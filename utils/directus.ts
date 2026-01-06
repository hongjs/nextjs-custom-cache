export async function getPromotions(revalidate: number | undefined) {
  try {
    const directusHost = process.env.DIRECTUS_HOST;
    const directusToken = process.env.DIRECTUS_TOKEN;

    if (!directusHost || !directusToken) {
      console.warn('[getPromotions] Configuration missing');
      return { error: 'Configuration missing' };
    }

    const url = `${directusHost}/promotions?limit=10&filter[status][_eq]=draft`;
    const config: Partial<RequestInit> = {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    }
    if(revalidate){
      config['next'] = { revalidate: revalidate }
    }
    else {
      config['cache'] = 'no-store'
    }

    console.log(`[${new Date().toISOString()}] Fetching promotions from ${directusHost}...`);
    const response = await fetch(url, config);

    if (!response.ok) {
      console.error(`[getPromotions] HTTP ${response.status}: ${response.statusText}`);
      return { error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();

    if (data && data.data) {
      console.log(`[${new Date().toISOString()}] ✓ Fetched ${data.data.length} promotions`);
    }

    return data;
  } catch (error) {
    console.error('[getPromotions] Error:', error);
    return { error: String(error) };
  }
}

export async function getPromotionById(id: string, revalidate: number | undefined) {
  try {
    const directusHost = process.env.DIRECTUS_HOST;
    const directusToken = process.env.DIRECTUS_TOKEN;

    if (!directusHost || !directusToken) {
      console.warn('[getPromotionById] Configuration missing');
      return { error: 'Configuration missing' };
    }

    const url = `${directusHost}/promotions/${id}`;
    const config: Partial<RequestInit> = {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    }
    if(revalidate){
      config['next'] = { revalidate: revalidate }
    }
    else {
      config['cache'] = 'no-store'
    }

    console.log(`[${new Date().toISOString()}] Fetching promotion ${id}...`);
    const response = await fetch(url, config);

    if (!response.ok) {
      console.error(`[getPromotionById] HTTP ${response.status} for id=${id}`);
      return { error: `Promotion not found (${response.status})` };
    }

    const data = await response.json();
    console.log(`[${new Date().toISOString()}] ✓ Fetched promotion id=${id}`);
    return { promotion: data.data };
  } catch (error) {
    console.error(`[getPromotionById] Error for id=${id}:`, error);
    return { error: String(error) };
  }
}