export async function indexOwnerOfRepositories() {
  const developers = await fetch(`http://localhost:3006/api/data/developers?page=1&perPage=1000`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!
    }
  });
  const developersData = await developers.json();

  for (const developer of developersData) {
    const ownerOfRepositories = await fetch(`http://localhost:3006/api/data/repositories?owner=${developer.name}&status=active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!
      }
    });
    const ownerOfRepositoriesData = await ownerOfRepositories.json();
    console.log(ownerOfRepositoriesData);
  }
}