import { getClient } from '@umami/api-client';

// Get the configured Umami client
const client = getClient();

export interface UmamiStats {
  pageviews: { value: number; change: number };
  uniques: { value: number; change: number };
  bounces: { value: number; change: number };
  totaltime: { value: number; change: number };
}

export interface UmamiPageview {
  t: string; // timestamp
  y: number; // count
}

export interface UmamiMetric {
  x: string; // name/path
  y: number; // count
  z: number; // percentage
}

export async function getUmamiStats(websiteId: string, startAt: number, endAt: number): Promise<UmamiStats> {
  const { ok, data, error } = await client.getWebsiteStats(websiteId, {
    startAt,
    endAt,
  });

  if (!ok) {
    throw new Error(`Failed to get stats: ${error}`);
  }

  return {
    pageviews: { value: data.pageviews, change: 0 },
    uniques: { value: data.uniques, change: 0 },
    bounces: { value: data.bounces, change: 0 },
    totaltime: { value: data.totaltime, change: 0 },
  };
}

export async function getUmamiPageviews(websiteId: string, startAt: number, endAt: number): Promise<UmamiPageview[]> {
  const { ok, data, error } = await client.getWebsitePageviews(websiteId, {
    startAt,
    endAt,
    unit: 'day',
  });

  if (!ok) {
    throw new Error(`Failed to get pageviews: ${error}`);
  }

  return data.map((item: any) => ({
    t: item.t,
    y: item.y,
  }));
}

export async function getUmamiTopPages(websiteId: string, startAt: number, endAt: number): Promise<UmamiMetric[]> {
  const { ok, data, error } = await client.getWebsiteMetrics(websiteId, {
    startAt,
    endAt,
    type: 'url',
  });

  if (!ok) {
    throw new Error(`Failed to get top pages: ${error}`);
  }

  return data.map((item: any) => ({
    x: item.x,
    y: item.y,
    z: item.z,
  }));
}

export async function getUmamiReferrers(websiteId: string, startAt: number, endAt: number): Promise<UmamiMetric[]> {
  const { ok, data, error } = await client.getWebsiteMetrics(websiteId, {
    startAt,
    endAt,
    type: 'referrer',
  });

  if (!ok) {
    throw new Error(`Failed to get referrers: ${error}`);
  }

  return data.map((item: any) => ({
    x: item.x,
    y: item.y,
    z: item.z,
  }));
}

export async function getUmamiBrowsers(websiteId: string, startAt: number, endAt: number): Promise<UmamiMetric[]> {
  const { ok, data, error } = await client.getWebsiteMetrics(websiteId, {
    startAt,
    endAt,
    type: 'browser',
  });

  if (!ok) {
    throw new Error(`Failed to get browsers: ${error}`);
  }

  return data.map((item: any) => ({
    x: item.x,
    y: item.y,
    z: item.z,
  }));
}

export async function getUmamiOperatingSystems(websiteId: string, startAt: number, endAt: number): Promise<UmamiMetric[]> {
  const { ok, data, error } = await client.getWebsiteMetrics(websiteId, {
    startAt,
    endAt,
    type: 'os',
  });

  if (!ok) {
    throw new Error(`Failed to get operating systems: ${error}`);
  }

  return data.map((item: any) => ({
    x: item.x,
    y: item.y,
    z: item.z,
  }));
}

export async function getUmamiDevices(websiteId: string, startAt: number, endAt: number): Promise<UmamiMetric[]> {
  const { ok, data, error } = await client.getWebsiteMetrics(websiteId, {
    startAt,
    endAt,
    type: 'device',
  });

  if (!ok) {
    throw new Error(`Failed to get devices: ${error}`);
  }

  return data.map((item: any) => ({
    x: item.x,
    y: item.y,
    z: item.z,
  }));
}
