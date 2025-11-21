// Umami Analytics API Helper
const USE_HARDCODED_UMAMI = true; // keep true until env fixed
const HARDCODED_BASE_URL = 'https://umami.lkw1615.synology.me';
const HARDCODED_USERNAME = 'admin';
const HARDCODED_PASSWORD = 'T18%K{3$Xx0=';

function getBaseUrl() {
  return USE_HARDCODED_UMAMI ? HARDCODED_BASE_URL : (process.env.UMAMI_BASE_URL || '');
}

interface UmamiAuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    createdAt: string;
    isAdmin: boolean;
  };
}

interface UmamiWebsite {
  id: string;
  name: string;
  domain: string;
  shareId: string;
  createdAt: string;
  updatedAt: string;
}

interface UmamiStats {
  pageviews: { value: number; change: number };
  uniques: { value: number; change: number };
  bounces: { value: number; change: number };
  totaltime: { value: number; change: number };
}


interface UmamiMetric {
  x: string; // name/path
  y: number; // count
  z: number; // percentage
}

// Cache for auth token
let authToken: string | null = null;
let tokenExpiry: number = 0;

export async function loginUmami(): Promise<string> {
  const baseUrl = getBaseUrl();
  const username = USE_HARDCODED_UMAMI ? HARDCODED_USERNAME : (process.env.UMAMI_USERNAME || '');
  const password = USE_HARDCODED_UMAMI ? HARDCODED_PASSWORD : (process.env.UMAMI_PASSWORD || '');

  if (!baseUrl || !username || !password) {
    throw new Error('Umami credentials not configured');
  }

  console.log('Umami login attempt:', {
    baseUrl: baseUrl,
    username: username,
    passwordLength: password.length
  });

  try {
    const loginData = {
      username: username,
      password: password,
    };

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log('Umami login response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Umami login error response:', errorText);
      throw new Error(`Umami login failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: UmamiAuthResponse = await response.json();
    authToken = data.token;
    tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    console.log('Umami login successful:', {
      tokenLength: authToken.length,
      username: data.user.username
    });
    
    return authToken;
  } catch (error) {
    console.error('Umami login error:', error);
    throw error;
  }
}

export async function getValidAuth(): Promise<string> {
  // Check if we have a valid cached token
  if (authToken && Date.now() < tokenExpiry) {
    return authToken;
  }

  // Get a new token
  return await loginUmami();
}

export async function getWebsiteId(): Promise<string> {
  if (process.env.UMAMI_WEBSITE_ID) {
    return process.env.UMAMI_WEBSITE_ID;
  }

  // If no website ID provided, try to get it from the API
  const token = await getValidAuth();
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/websites`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get websites: ${response.status} ${response.statusText}`);
  }

  const websites: UmamiWebsite[] = await response.json();
  if (websites.length === 0) {
    throw new Error('No websites found in Umami');
  }

  return websites[0].id;
}

export async function umamiFetch(endpoint: string): Promise<unknown> {
  const token = await getValidAuth();
  const websiteId = process.env.UMAMI_WEBSITE_ID || '';
  const baseUrl = getBaseUrl();
  
  const url = `${baseUrl}${endpoint.replace(':id', websiteId)}`;
  
  console.log('Umami API call:', url);
  
  try {
    // Add timeout to prevent hanging (15 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`Umami upstream error [${endpoint}]:`, res.status, res.statusText, text);
      throw new Error(`Umami API error: ${res.status} ${res.statusText} ${text ? `- ${text}` : ''}`);
    }

    return res.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Check for DNS/network errors
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.error('Umami DNS/Network error - hostname may be unreachable:', baseUrl);
        throw new Error(`Umami hostname unreachable: ${baseUrl}. Check if the service is running and accessible.`);
      }
      if (error.name === 'AbortError') {
        console.error('Umami request timeout');
        throw new Error('Umami request timeout - service may be slow or unreachable');
      }
    }
    throw error;
  }
}

export async function getUmamiStats(startAt: number, endAt: number): Promise<UmamiStats> {
  // Calculate appropriate unit based on time range (day for < 12 months, month for >= 12 months)
  const daysDiff = (endAt - startAt) / (1000 * 60 * 60 * 24);
  const unit = daysDiff > 365 ? 'month' : 'day';
  return await umamiFetch(`/api/websites/:id/stats?startAt=${startAt}&endAt=${endAt}&unit=${unit}&timezone=UTC`) as UmamiStats;
}

export async function getUmamiPageviews(startAt: number, endAt: number, unit: 'day' | 'month' = 'day') {
  const data = await umamiFetch(`/api/websites/:id/pageviews?startAt=${startAt}&endAt=${endAt}&unit=${unit}&timezone=UTC`);
  const arr = Array.isArray(data) ? data : (Array.isArray((data as Record<string, unknown>)?.pageviews) ? (data as Record<string, unknown>).pageviews : []);
  return (arr as Array<Record<string, unknown>>).map((it: Record<string, unknown>) => ({ 
    t: it.t ?? it.timestamp ?? it.date ?? it.x, 
    y: it.y ?? it.value ?? 0 
  })).filter(it => it?.t != null);
}

export async function getUmamiTopPages(startAt: number, endAt: number): Promise<UmamiMetric[]> {
  // Calculate appropriate unit based on time range (day for < 12 months, month for >= 12 months)
  const daysDiff = (endAt - startAt) / (1000 * 60 * 60 * 24);
  const unit = daysDiff > 365 ? 'month' : 'day';
  return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&unit=${unit}&type=path&timezone=UTC`) as UmamiMetric[];
}

export async function getUmamiReferrers(startAt: number, endAt: number): Promise<UmamiMetric[]> {
  const daysDiff = (endAt - startAt) / (1000 * 60 * 60 * 24);
  const unit = daysDiff > 365 ? 'month' : 'day';
  return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&unit=${unit}&type=referrer&timezone=UTC`) as UmamiMetric[];
}

export async function getUmamiBrowsers(startAt: number, endAt: number): Promise<UmamiMetric[]> {
  const daysDiff = (endAt - startAt) / (1000 * 60 * 60 * 24);
  const unit = daysDiff > 365 ? 'month' : 'day';
  return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&unit=${unit}&type=browser&timezone=UTC`) as UmamiMetric[];
}

export async function getUmamiOperatingSystems(startAt: number, endAt: number): Promise<UmamiMetric[]> {
  const daysDiff = (endAt - startAt) / (1000 * 60 * 60 * 24);
  const unit = daysDiff > 365 ? 'month' : 'day';
  return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&unit=${unit}&type=os&timezone=UTC`) as UmamiMetric[];
}

export async function getUmamiDevices(startAt: number, endAt: number): Promise<UmamiMetric[]> {
  const daysDiff = (endAt - startAt) / (1000 * 60 * 60 * 24);
  const unit = daysDiff > 365 ? 'month' : 'day';
  try {
    return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&unit=${unit}&type=device&timezone=UTC`) as UmamiMetric[];
  } catch (error) {
    // Some Umami versions might not support 'device' type, try alternative
    console.warn('Umami devices API failed with type=device, trying type=screen...', error);
    try {
      return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&unit=${unit}&type=screen&timezone=UTC`) as UmamiMetric[];
    } catch {
      // If both fail, return empty array
      console.warn('Umami devices API not available, returning empty array');
      return [];
    }
  }
}
