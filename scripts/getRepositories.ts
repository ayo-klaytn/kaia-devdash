// @ts-expect-error - kaia.toml is not typed
import kaia from "./kaia.toml";

export async function getRepositories() {
  for (const repo of kaia.repo) {
    const owner = repo.url.split("/")[3];
    const name = repo.url.split("/")[4];
    const url = repo.url;
    const repositoryData = {
      owner,
      name,
      url,
      status: "inactive",
      remark: "external",
    }
    console.log(repositoryData);
    const response = await fetch("http://localhost:3006/api/data/repositories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!
      },
      body: JSON.stringify(repositoryData),
    });
    const data = await response.json();
    console.log(data);
  }
}

getRepositories();

