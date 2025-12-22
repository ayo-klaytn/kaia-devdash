import { NextResponse } from "next/server";
import { headers } from "next/headers";
import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";

/**
 * POST /api/jobs/fetch-x-posts
 * Scheduled job to process CSV file and upload new X/Twitter posts
 * Can be called via cron or manually
 * Requires API_SECRET in headers (or CRON_SECRET for cron jobs)
 */
export async function POST(): Promise<NextResponse> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    const apiSecret = headersList.get("apiSecret");
    const expectedToken = process.env.API_SECRET || process.env.CRON_SECRET;

    // Optional: require auth token for security
    if (expectedToken) {
      if (authHeader && authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (apiSecret && apiSecret !== expectedToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (!authHeader && !apiSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Look for CSV file in multiple locations
    const possiblePaths = [
      path.join(process.cwd(), "lib", "mocks", "x-posts.csv"),
      path.join(process.cwd(), "lib", "data", "x-posts.csv"),
      path.join(process.cwd(), "scripts", "x-posts.csv"),
      path.join(process.cwd(), "x-posts.csv"),
    ];

    let csvPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        csvPath = possiblePath;
        break;
      } catch {
        // File doesn't exist, try next path
        continue;
      }
    }

    if (!csvPath) {
      return NextResponse.json(
        {
          success: false,
          message: "CSV file not found. Please ensure x-posts.csv exists in one of the expected locations.",
          searchedPaths: possiblePaths,
        },
        { status: 404 }
      );
    }

    // Read and parse CSV
    const csvText = await fs.readFile(csvPath, "utf8");

    // Parse CSV using PapaParse
    interface CsvRow {
      Title?: string;
      title?: string;
      URL?: string;
      url?: string;
      Views?: string;
      views?: string;
      Likes?: string;
      likes?: string;
      Retweets?: string;
      retweets?: string;
      Comments?: string;
      comments?: string;
      Date?: string;
      date?: string;
      Type?: string;
      type?: string;
      Account?: string;
      account?: string;
    }
    const parseResult = Papa.parse<CsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Normalize header names (case-insensitive, handle spaces)
        return header
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[^a-z0-9]/g, "");
      },
    });

    if (parseResult.errors.length > 0) {
      console.warn("CSV parsing warnings:", parseResult.errors);
    }

    const posts = parseResult.data;

    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "CSV file is empty or contains no valid posts",
        processed: 0,
      });
    }

    // Get base URL for internal API call
    const host = headersList.get("host") || "localhost:3006";
    const proto = headersList.get("x-forwarded-proto") || "http";
    const baseUrl = `${proto}://${host}`;

    // Upload posts to database via API
    const uploadResponse = await fetch(`${baseUrl}/api/data/x-posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiSecret: expectedToken || "",
      },
      body: JSON.stringify(posts),
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      return NextResponse.json(
        {
          success: false,
          message: "Failed to upload posts to database",
          error: errorData,
        },
        { status: uploadResponse.status }
      );
    }

    const uploadResult = await uploadResponse.json();

    return NextResponse.json({
      success: true,
      message: "CSV processed successfully",
      csvFile: csvPath,
      totalRows: posts.length,
      ...uploadResult,
    });
  } catch (error) {
    console.error("Error in fetch-x-posts job:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process CSV",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jobs/fetch-x-posts
 * Check job status and provide information about CSV file location
 */
export async function GET(): Promise<NextResponse> {
  const possiblePaths = [
    path.join(process.cwd(), "lib", "mocks", "x-posts.csv"),
    path.join(process.cwd(), "lib", "data", "x-posts.csv"),
    path.join(process.cwd(), "scripts", "x-posts.csv"),
    path.join(process.cwd(), "x-posts.csv"),
  ];

  const foundFiles: Array<{ path: string; exists: boolean; size?: number }> = [];

  for (const filePath of possiblePaths) {
    try {
      const stats = await fs.stat(filePath);
      foundFiles.push({
        path: filePath,
        exists: true,
        size: stats.size,
      });
    } catch {
      foundFiles.push({
        path: filePath,
        exists: false,
      });
    }
  }

  return NextResponse.json({
    message: "X Posts CSV Processor",
    instructions: [
      "1. Create a CSV file named 'x-posts.csv' with the following columns:",
      "   - Title, URL, Views, Likes, Retweets, Comments (optional), Date, Type, Account (optional, defaults to BuildonKaia)",
      "2. Place the CSV file in one of these locations:",
      ...possiblePaths.map((p) => `   - ${p}`),
      "3. Call POST /api/jobs/fetch-x-posts to process the CSV",
      "4. The job will check for new posts and insert/update them in the database",
    ],
    searchedPaths: foundFiles,
    csvFormat: {
      requiredColumns: ["Title", "URL", "Date", "Type"],
      optionalColumns: ["Views", "Likes", "Retweets", "Comments", "Account"],
      example: {
        Title: "Kaia v2.1.0 Announcement",
        URL: "https://x.com/BuildonKaia/status/1983081299431858612",
        Views: "9k",
        Likes: "40",
        Retweets: "14",
        Comments: "3",
        Date: "2025-10-28",
        Type: "Announcement",
        Account: "BuildonKaia",
      },
    },
  });
}

