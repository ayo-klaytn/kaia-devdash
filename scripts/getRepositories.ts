async function getRepositories() {
  const response = await fetch("https://api.github.com/users/kaia-labs/repos");
  const data = await response.json();
  return data;
}

