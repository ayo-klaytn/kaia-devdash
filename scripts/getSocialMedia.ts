import fs from "fs";
import Papa from "papaparse";

const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(/[\s_]+/)
    .map((word, index) =>
      index === 0 ? word : word[0].toUpperCase() + word.slice(1)
    )
    .join("");
};

interface SocialMediaData {
  date: string;
  impressions: string;
  likes: string;
  engagements: string;
  bookmarks: string;
  shares: string;
  newfollows: string;
  unfollows: string;
  replies: string;
  reposts: string;
  profilevisits: string;
  createpost: string;
  videoviews: string;
  mediaviews: string;
}

async function parseCsv(filePath: string) {
  const csvFile = fs.readFileSync(filePath, "utf8");
  const csvData = csvFile.toString();

  const jsonData = Papa.parse<SocialMediaData>(csvData, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => toCamelCase(header),
  });
  console.log(jsonData);
  return jsonData;
}

async function getSocialMedia() {
  const jsonData = await parseCsv("scripts/kaiadevintern.csv");
  const socialMediaData = jsonData.data;

  for (const data of socialMediaData) {
    const timestamp = new Date(data.date).getTime();
    const formattedData = {
      name: "kaiadevintern",
      date: timestamp,
      impressions: parseInt(data.impressions),
      likes: parseInt(data.likes),
      engagements: parseInt(data.engagements),
      bookmarks: parseInt(data.bookmarks),
      shares: parseInt(data.shares),
      newFollows: parseInt(data.newfollows),
      unfollows: parseInt(data.unfollows),
      replies: parseInt(data.replies),
      reposts: parseInt(data.reposts),
      profileVisits: parseInt(data.profilevisits),
      createPost: parseInt(data.createpost),
      videoViews: parseInt(data.videoviews),
      mediaViews: parseInt(data.mediaviews),
    };
    console.log(formattedData);

    const response = await fetch("http://localhost:3006/api/data/social-media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!,
      },
      body: JSON.stringify(formattedData),
    });

    const responseData = await response.json();
    console.log("Response:", responseData);
  }
}

getSocialMedia();
