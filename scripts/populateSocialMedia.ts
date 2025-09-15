import 'dotenv/config';

interface SocialMediaEntry {
  name: string;
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

export default async function populateSocialMedia() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006';
  const apiSecret = process.env.API_SECRET;
  
  if (!apiSecret) {
    console.error('API_SECRET not found in environment variables');
    return;
  }

  try {
    // Generate data for the last 12 months with realistic social media metrics
    const entries: SocialMediaEntry[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Generate realistic social media metrics for each month
      const baseImpressions = Math.floor(Math.random() * 5000) + 2000; // 2000-7000
      const baseEngagements = Math.floor(baseImpressions * 0.03) + 50; // ~3% engagement rate
      const baseLikes = Math.floor(baseEngagements * 0.6) + 20; // ~60% of engagements
      
      const entry: SocialMediaEntry = {
        name: "kaiadevintern",
        date: dateStr,
        impressions: baseImpressions,
        likes: baseLikes,
        engagements: baseEngagements,
        bookmarks: Math.floor(baseEngagements * 0.1) + 5, // ~10% of engagements
        shares: Math.floor(baseEngagements * 0.15) + 3, // ~15% of engagements
        newFollows: Math.floor(Math.random() * 20) + 5, // 5-25 new followers
        unfollows: Math.floor(Math.random() * 8) + 1, // 1-9 unfollows
        replies: Math.floor(baseEngagements * 0.2) + 5, // ~20% of engagements
        reposts: Math.floor(baseEngagements * 0.1) + 2, // ~10% of engagements
        profileVisits: Math.floor(baseImpressions * 0.02) + 30, // ~2% of impressions
        createPost: Math.floor(Math.random() * 15) + 8, // 8-23 posts per month
        videoViews: Math.floor(baseImpressions * 0.4) + 100, // ~40% of impressions
        mediaViews: Math.floor(baseImpressions * 0.6) + 150, // ~60% of impressions
      };
      
      entries.push(entry);
    }
    
    console.log(`Generated ${entries.length} social media entries for the last 12 months`);
    
    for (const entry of entries) {
      console.log('Creating social media entry for:', entry.date);

      try {
        const createResponse = await fetch(`${baseUrl}/api/data/social-media`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apiSecret": apiSecret
          },
          body: JSON.stringify(entry)
        });

        if (createResponse.ok) {
          const result = await createResponse.json();
          console.log('✅ Social media entry created for:', result.date);
        } else {
          const error = await createResponse.json();
          if (error.error === "Social media entry already exists for this date") {
            console.log('⚠️  Entry already exists for:', entry.date);
          } else {
            console.log('❌ Failed to create entry:', error);
          }
        }
      } catch (fetchError) {
        console.error('❌ Fetch error for entry:', entry.date, fetchError);
      }
    }
    
    console.log('Finished populating social media data');
  } catch (error) {
    console.error('Error in populateSocialMedia:', error);
  }
}

populateSocialMedia();


