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
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('Umami upstream error:', res.status, res.statusText, text);
    throw new Error(`Umami API error: ${res.status} ${res.statusText} ${text ? `- ${text}` : ''}`);
  }

  return res.json();
}

export async function getUmamiStats(startAt: number, endAt: number): Promise<UmamiStats> {
  return await umamiFetch(`/api/websites/:id/stats?startAt=${startAt}&endAt=${endAt}&timezone=UTC`) as UmamiStats;
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
  return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&type=url&timezone=UTC`) as UmamiMetric[];
}

export async function getUmamiReferrers(startAt: number, endAt: number): Promise<UmamiMetric[]> {
  return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&type=referrer&timezone=UTC`) as UmamiMetric[];
}

export async function getUmamiBrowsers(startAt: number, endAt: number): Promise<UmamiMetric[]> {
  return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&type=browser&timezone=UTC`) as UmamiMetric[];
}

export async function getUmamiOperatingSystems(startAt: number, endAt: number): Promise<UmamiMetric[]> {
  return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&type=os&timezone=UTC`) as UmamiMetric[];
}

export async function getUmamiDevices(startAt: number, endAt: number): Promise<UmamiMetric[]> {
  return await umamiFetch(`/api/websites/:id/metrics?startAt=${startAt}&endAt=${endAt}&type=device&timezone=UTC`) as UmamiMetric[];
}
