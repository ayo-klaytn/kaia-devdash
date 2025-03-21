import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

interface Analytics {
  date: string;
  impressions: number;
  likes: number;
  engagements: number;
  bookmarks: number;
  shares: number;
  newFollows: number;
  unfollows: number;
  replies: number;
  reposts: number;
  profileVisits: number;
  createPost: number;
  videoViews: number;
  mediaViews: number;
}

interface CSVRow {
  Date: string;
  Impressions: string;
  Likes: string;
  Engagements: string;
  Bookmarks: string;
  Shares: string;
  'New follows': string;
  Unfollows: string;
  Replies: string;
  Reposts: string;
  'Profile visits': string;
  'Create Post': string;
  'Video views': string;
  'Media views': string;
}

export async function processAnalyticsData(): Promise<void> {
  const csvFilePath = path.join(process.cwd(), 'lib', 'data', 'kaiadevintern_account_overview_analytics.csv');
  const jsonFilePath = path.join(process.cwd(), 'lib', 'data', 'kaiadevintern_account_overview_analytics.json');

  const analytics: Analytics[] = [];

  // Create a readable stream
  const fileContent = fs.createReadStream(csvFilePath);

  // Create the parser
  const parser = parse({
    columns: true,
    skip_empty_lines: true
  });

  // Use promises to handle the data
  const processFile = new Promise((resolve, reject) => {
    fileContent.pipe(parser)
      .on('data', (row: CSVRow) => {
        analytics.push({
          date: row.Date,
          impressions: parseInt(row.Impressions),
          likes: parseInt(row.Likes),
          engagements: parseInt(row.Engagements),
          bookmarks: parseInt(row.Bookmarks),
          shares: parseInt(row.Shares),
          newFollows: parseInt(row['New follows']),
          unfollows: parseInt(row.Unfollows),
          replies: parseInt(row.Replies),
          reposts: parseInt(row.Reposts),
          profileVisits: parseInt(row['Profile visits']),
          createPost: parseInt(row['Create Post']),
          videoViews: parseInt(row['Video views']),
          mediaViews: parseInt(row['Media views'])
        });
      })
      .on('end', () => {
        // Write to JSON file
        fs.writeFileSync(jsonFilePath, JSON.stringify({ analytics }, null, 2));
        console.log('CSV has been processed and saved as JSON');
        resolve(true);
      })
      .on('error', reject);
  });

  await processFile;
}

// Run the function if this file is executed directly
if (require.main === module) {
  processAnalyticsData()
    .catch(console.error);
}
