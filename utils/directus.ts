export async function getPromotions(revalidate: number | undefined) {
  try {
    const directusHost = process.env.DIRECTUS_HOST;
    const directusToken = process.env.DIRECTUS_TOKEN;

    if (!directusHost || !directusToken) {
      return { error: 'Configuration missing' };
    }

    const url = `${directusHost}/promotions?limit=10&filter[status][_eq]=draft`;
    const config: Partial<RequestInit> = {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
      },
    }
    if(revalidate){
      config['next'] = { revalidate: revalidate }
    } 
    else {
      config['cache'] = 'no-store'
    }
    const response = await fetch(url, config);

    const data = await response.json();
    console.log(`[${new Date().toISOString()}] fetched data ${data.data.length} records`)
    return data;
  } catch (error) {
    return { error: String(error) };
  }
}

export async function getPromotionById(id: string, revalidate: number | undefined) {
  try {
    const directusHost = process.env.DIRECTUS_HOST;
    const directusToken = process.env.DIRECTUS_TOKEN;

    if (!directusHost || !directusToken) {
      return { error: 'Configuration missing' };
    }

    const url = `${directusHost}/promotions/${id}`;
    const config: Partial<RequestInit> = {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
      },
    }
    if(revalidate){
      config['next'] = { revalidate: revalidate }
    } 
    else {
      config['cache'] = 'no-store'
    }
    const response = await fetch(url, config);

    if (!response.ok) {
      return { error: `Promotion not found (${response.status})` };
    }

    const data = await response.json();
    console.log(`[${new Date().toISOString()}] fetched data id=${id}`)
    return { promotion: data.data };
  } catch (error) {
    return { error: String(error) };
  }
}