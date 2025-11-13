import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import db from "@/lib/db";
import { developer } from "@/lib/db/schema";
import { getCachedData, setCachedData, generateCacheKey, CACHE_TTL } from "@/lib/cache";

// Check if is_fork column exists
async function hasIsForkColumn(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'repository' 
      AND column_name = 'is_fork';
    `) as Array<{ column_name: string }> | { rows?: Array<{ column_name: string }> };
    const rows = Array.isArray(result) ? result : (result.rows ?? []);
    return rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get developer demographics (location breakdown)
 * Returns country-level aggregation of top contributors
 */
export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
    const days = parseInt(req.nextUrl.searchParams.get("days") || "365");

    // Check cache first
    const cacheKey = generateCacheKey("developer-demographics", { limit, days });
    type DeveloperDemographicsResponse = {
      totalContributors: number;
      contributorsWithLocation: number;
      countryBreakdown: Array<{
        country: string;
        developerCount: number;
        totalCommits: number;
        topDevelopers: Array<{ name: string; commitCount: number }>;
      }>;
    };
    const cached = await getCachedData<DeveloperDemographicsResponse>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Directly query top contributors instead of making an internal API call
    const hasForkColumn = await hasIsForkColumn();
    const forkFilter = hasForkColumn ? sql`AND (COALESCE(r.is_fork, false) = false)` : sql``;
    const excludeSpecificRepos = sql`
      AND NOT (
        (LOWER(r.owner) = 'kaiachain' AND LOWER(r.name) = 'kaia')
        OR (LOWER(r.owner) = 'carv-protocol' AND LOWER(r.name) = 'eliza-d.a.t.a')
      )
    `;

    const EMAIL_FILTER_SQL = `
      c.committer_email IS NOT NULL
      AND c.committer_email <> ''
      AND c.timestamp IS NOT NULL
      AND LOWER(c.committer_email) NOT LIKE '%noreply@github.com%'
      AND LOWER(c.committer_email) NOT LIKE '%github-actions%'
      AND LOWER(c.committer_email) NOT LIKE '%[bot]%'
      AND LOWER(c.committer_email) NOT LIKE '%bot@%'
    `;

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);
    const thresholdDateStr = thresholdDate.toISOString();

    // Get top contributors directly
    const topContributorsResult = await db.execute(sql`
      SELECT 
        LOWER(TRIM(c.committer_email)) AS email,
        MAX(c.committer_name) AS name,
        COUNT(c.sha)::int AS commit_count
      FROM "commit" c
      JOIN repository r ON r.id = c.repository_id
      WHERE c.timestamp >= ${thresholdDateStr}
        AND ${sql.raw(EMAIL_FILTER_SQL)}
        ${forkFilter} ${excludeSpecificRepos}
      GROUP BY LOWER(TRIM(c.committer_email))
      ORDER BY commit_count DESC
      LIMIT ${limit};
    `);

    const contributors = Array.isArray(topContributorsResult)
      ? (topContributorsResult as Array<{
          email: string;
          name: string | null;
          commit_count: number;
        }>)
      : ((topContributorsResult.rows ?? []) as Array<{
          email: string;
          name: string | null;
          commit_count: number;
        }>);

    // Get all developers with locations in one query
    const allDevelopers = await db
      .select({
        github: developer.github,
        name: developer.name,
        location: developer.location,
      })
      .from(developer)
      .where(sql`${developer.location} IS NOT NULL`);

    // Create a lookup map for faster matching
    const locationMap = new Map<string, string>();
    for (const dev of allDevelopers) {
      // Extract email prefix from GitHub URL or use name
      if (dev.github) {
        const githubMatch = dev.github.match(/github\.com\/([^\/]+)/);
        if (githubMatch) {
          locationMap.set(githubMatch[1].toLowerCase(), dev.location!);
        }
      }
      if (dev.name) {
        locationMap.set(dev.name.toLowerCase(), dev.location!);
      }
    }

    // Match contributors with locations
    const contributorsWithLocation = contributors.map((contrib) => {
      const emailPrefix = contrib.email.split('@')[0].toLowerCase();
      const nameLower = (contrib.name || '').toLowerCase();
      
      // Try to find location by email prefix or name
      const location = locationMap.get(emailPrefix) || locationMap.get(nameLower) || null;

      return {
        email: contrib.email,
        name: contrib.name || contrib.email.split("@")[0],
        commitCount: contrib.commit_count,
        location,
      };
    });

    // Aggregate by country
    const countryCounts: Record<string, { count: number; developers: Array<{ name: string; commitCount: number }> }> = {};

    for (const contrib of contributorsWithLocation) {
      if (!contrib.location) {
        const unknown = countryCounts['Unknown'] || { count: 0, developers: [] };
        unknown.count += 1;
        unknown.developers.push({
          name: contrib.name,
          commitCount: contrib.commitCount,
        });
        countryCounts['Unknown'] = unknown;
        continue;
      }

      // Normalize location to country (simple heuristic)
      const country = normalizeToCountry(contrib.location);
      if (!countryCounts[country]) {
        countryCounts[country] = { count: 0, developers: [] };
      }
      countryCounts[country].count += 1;
      countryCounts[country].developers.push({
        name: contrib.name,
        commitCount: contrib.commitCount,
      });
    }

    // Convert to array and sort by count
    const countryBreakdown = Object.entries(countryCounts)
      .map(([country, data]) => {
        const sortedDevs = data.developers.sort((a, b) => b.commitCount - a.commitCount);
        return {
          country,
          developerCount: data.count,
          totalCommits: sortedDevs.reduce((sum, d) => sum + d.commitCount, 0),
          topDevelopers: sortedDevs.slice(0, 5), // Top 5 per country
        };
      })
      .sort((a, b) => b.developerCount - a.developerCount);

    const responseData = {
      totalContributors: contributorsWithLocation.length,
      contributorsWithLocation: contributorsWithLocation.filter((c) => c.location !== null).length,
      countryBreakdown,
    };

    // Cache the response
    await setCachedData(cacheKey, responseData, CACHE_TTL.DEVELOPER_DEMOGRAPHICS);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching developer demographics:", error);
    return NextResponse.json(
      { error: "Failed to fetch developer demographics" },
      { status: 500 }
    );
  }
}

/**
 * Normalize location to country (handles cities, regions, and country names)
 */
function normalizeToCountry(location: string): string {
  const lower = location.toLowerCase().trim();

  // City to country mapping
  const cityToCountry: Record<string, string> = {
    // South Korea cities
    'seoul': 'South Korea',
    'busan': 'South Korea',
    'incheon': 'South Korea',
    'daegu': 'South Korea',
    'daejeon': 'South Korea',
    'gwangju': 'South Korea',
    'ulsan': 'South Korea',
    'suwon': 'South Korea',
    'changwon': 'South Korea',
    'goyang': 'South Korea',
    'seongnam': 'South Korea',
    'bucheon': 'South Korea',
    'ansan': 'South Korea',
    'anyang': 'South Korea',
    'jeonju': 'South Korea',
    'cheonan': 'South Korea',
    'namyangju': 'South Korea',
    'hwasong': 'South Korea',
    'pohang': 'South Korea',
    'jeju': 'South Korea',
    
    // USA cities
    'san francisco': 'United States',
    'new york': 'United States',
    'los angeles': 'United States',
    'chicago': 'United States',
    'houston': 'United States',
    'phoenix': 'United States',
    'philadelphia': 'United States',
    'san antonio': 'United States',
    'san diego': 'United States',
    'dallas': 'United States',
    'austin': 'United States',
    'seattle': 'United States',
    'boston': 'United States',
    'miami': 'United States',
    'atlanta': 'United States',
    'denver': 'United States',
    'portland': 'United States',
    'washington': 'United States',
    'detroit': 'United States',
    'minneapolis': 'United States',
    'tampa': 'United States',
    'nashville': 'United States',
    'orlando': 'United States',
    'sacramento': 'United States',
    'pittsburgh': 'United States',
    'las vegas': 'United States',
    'cincinnati': 'United States',
    'kansas city': 'United States',
    'raleigh': 'United States',
    'indianapolis': 'United States',
    'columbus': 'United States',
    'charlotte': 'United States',
    'san jose': 'United States',
    'oakland': 'United States',
    'brooklyn': 'United States',
    'manhattan': 'United States',
    
    // Vietnam cities
    'ho chi minh': 'Vietnam',
    'hanoi': 'Vietnam',
    'da nang': 'Vietnam',
    'haiphong': 'Vietnam',
    'can tho': 'Vietnam',
    'hue': 'Vietnam',
    'nha trang': 'Vietnam',
    'vung tau': 'Vietnam',
    
    // Japan cities
    'tokyo': 'Japan',
    'osaka': 'Japan',
    'kyoto': 'Japan',
    'yokohama': 'Japan',
    'nagoya': 'Japan',
    'sapporo': 'Japan',
    'fukuoka': 'Japan',
    'kobe': 'Japan',
    'sendai': 'Japan',
    'hiroshima': 'Japan',
    
    // China cities
    'beijing': 'China',
    'shanghai': 'China',
    'guangzhou': 'China',
    'shenzhen': 'China',
    'chengdu': 'China',
    'hangzhou': 'China',
    'wuhan': 'China',
    'xian': 'China',
    'nanjing': 'China',
    'tianjin': 'China',
    
    // India cities
    'mumbai': 'India',
    'delhi': 'India',
    'bangalore': 'India',
    'hyderabad': 'India',
    'chennai': 'India',
    'kolkata': 'India',
    'pune': 'India',
    'ahmedabad': 'India',
    'jaipur': 'India',
    'surat': 'India',
    
    // UK cities
    'london': 'United Kingdom',
    'manchester': 'United Kingdom',
    'birmingham': 'United Kingdom',
    'glasgow': 'United Kingdom',
    'liverpool': 'United Kingdom',
    'edinburgh': 'United Kingdom',
    'bristol': 'United Kingdom',
    'leeds': 'United Kingdom',
    'sheffield': 'United Kingdom',
    'cardiff': 'United Kingdom',
    
    // Canada cities
    'toronto': 'Canada',
    'vancouver': 'Canada',
    'montreal': 'Canada',
    'calgary': 'Canada',
    'ottawa': 'Canada',
    'edmonton': 'Canada',
    'winnipeg': 'Canada',
    'quebec': 'Canada',
    
    // Germany cities
    'berlin': 'Germany',
    'munich': 'Germany',
    'hamburg': 'Germany',
    'frankfurt': 'Germany',
    'cologne': 'Germany',
    'stuttgart': 'Germany',
    'düsseldorf': 'Germany',
    'dortmund': 'Germany',
    
    // France cities
    'paris': 'France',
    'lyon': 'France',
    'marseille': 'France',
    'toulouse': 'France',
    'nice': 'France',
    'nantes': 'France',
    'strasbourg': 'France',
    
    // Australia cities
    'sydney': 'Australia',
    'melbourne': 'Australia',
    'brisbane': 'Australia',
    'perth': 'Australia',
    'adelaide': 'Australia',
    'canberra': 'Australia',
    
    // Brazil cities
    'são paulo': 'Brazil',
    'rio de janeiro': 'Brazil',
    'brasília': 'Brazil',
    'salvador': 'Brazil',
    'fortaleza': 'Brazil',
    'belo horizonte': 'Brazil',
    'manaus': 'Brazil',
    'curitiba': 'Brazil',
    
    // Nigeria cities
    'lagos': 'Nigeria',
    'abuja': 'Nigeria',
    'kano': 'Nigeria',
    'ibadan': 'Nigeria',
    'port harcourt': 'Nigeria',
    'benin city': 'Nigeria',
    'kaduna': 'Nigeria',
    'abia': 'Nigeria',
    
    // Indonesia cities
    'jakarta': 'Indonesia',
    'surabaya': 'Indonesia',
    'bandung': 'Indonesia',
    'medan': 'Indonesia',
    'semarang': 'Indonesia',
    'makassar': 'Indonesia',
    
    // Philippines cities
    'manila': 'Philippines',
    'cebu': 'Philippines',
    'davao': 'Philippines',
    'quezon city': 'Philippines',
    'caloocan': 'Philippines',
    
    // Thailand cities
    'bangkok': 'Thailand',
    'chiang mai': 'Thailand',
    'pattaya': 'Thailand',
    'phuket': 'Thailand',
    
    // Malaysia cities
    'kuala lumpur': 'Malaysia',
    'george town': 'Malaysia',
    'ipoh': 'Malaysia',
    'shah alam': 'Malaysia',
    'johor bahru': 'Malaysia',
  };

  // Check city mapping first
  for (const [city, country] of Object.entries(cityToCountry)) {
    if (lower === city || lower.startsWith(city + ',') || lower.includes(', ' + city)) {
      return country;
    }
  }

  // Country name patterns
  const countryMap: Record<string, string> = {
    'united states': 'United States',
    'usa': 'United States',
    'us': 'United States',
    'america': 'United States',
    'south korea': 'South Korea',
    'korea': 'South Korea',
    'republic of korea': 'South Korea',
    'vietnam': 'Vietnam',
    'viet nam': 'Vietnam',
    'singapore': 'Singapore',
    'japan': 'Japan',
    'china': 'China',
    'people\'s republic of china': 'China',
    'prc': 'China',
    'india': 'India',
    'united kingdom': 'United Kingdom',
    'uk': 'United Kingdom',
    'england': 'United Kingdom',
    'scotland': 'United Kingdom',
    'wales': 'United Kingdom',
    'germany': 'Germany',
    'deutschland': 'Germany',
    'france': 'France',
    'canada': 'Canada',
    'australia': 'Australia',
    'brazil': 'Brazil',
    'brasil': 'Brazil',
    'indonesia': 'Indonesia',
    'philippines': 'Philippines',
    'thailand': 'Thailand',
    'malaysia': 'Malaysia',
    'nigeria': 'Nigeria',
    'kenya': 'Kenya',
    'south africa': 'South Africa',
    'egypt': 'Egypt',
    'ghana': 'Ghana',
    'tanzania': 'Tanzania',
    'uganda': 'Uganda',
    'ethiopia': 'Ethiopia',
    'morocco': 'Morocco',
    'algeria': 'Algeria',
    'tunisia': 'Tunisia',
    'senegal': 'Senegal',
    'cameroon': 'Cameroon',
    'ivory coast': 'Ivory Coast',
    'côte d\'ivoire': 'Ivory Coast',
    'madagascar': 'Madagascar',
    'angola': 'Angola',
    'mozambique': 'Mozambique',
    'zambia': 'Zambia',
    'zimbabwe': 'Zimbabwe',
    'botswana': 'Botswana',
    'namibia': 'Namibia',
    'mauritius': 'Mauritius',
    'rwanda': 'Rwanda',
    'burundi': 'Burundi',
    'benin': 'Benin',
    'togo': 'Togo',
    'guinea': 'Guinea',
    'sierra leone': 'Sierra Leone',
    'liberia': 'Liberia',
    'gambia': 'Gambia',
    'cape verde': 'Cape Verde',
    'mali': 'Mali',
    'burkina faso': 'Burkina Faso',
    'niger': 'Niger',
    'chad': 'Chad',
    'sudan': 'Sudan',
    'south sudan': 'South Sudan',
    'eritrea': 'Eritrea',
    'djibouti': 'Djibouti',
    'somalia': 'Somalia',
    'comoros': 'Comoros',
    'seychelles': 'Seychelles',
    'equatorial guinea': 'Equatorial Guinea',
    'gabon': 'Gabon',
    'republic of the congo': 'Republic of the Congo',
    'democratic republic of the congo': 'Democratic Republic of the Congo',
    'central african republic': 'Central African Republic',
    'são tomé and príncipe': 'São Tomé and Príncipe',
    'guinea-bissau': 'Guinea-Bissau',
    'mauritania': 'Mauritania',
    'western sahara': 'Western Sahara',
    'libya': 'Libya',
  };

  // Check country patterns
  for (const [pattern, country] of Object.entries(countryMap)) {
    if (lower.includes(pattern)) {
      return country;
    }
  }

  // If no match, return original (might be a city we don't know about)
  return location;
}

