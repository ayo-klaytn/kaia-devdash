export default async function getDevelopers() {
  const response = await fetch("http://localhost:3006/api/data/contributors?page=1&limit=1200", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!
    }
  });
  const data = await response.json();
  
  for (const contributor of data) {
    const developerData = {
      name: contributor.username,
      github: contributor.htmlUrl,
      address: null,
      communityRank: null,
      xHandle: null,
      bootcampGraduated: null,
      bootcampContributor: null,
    }
    console.log(developerData);

    const response = await fetch("http://localhost:3006/api/data/developers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!
      },
      body: JSON.stringify(developerData)
    });

    const data = await response.json();
    console.log(data);
  }  
}

getDevelopers();