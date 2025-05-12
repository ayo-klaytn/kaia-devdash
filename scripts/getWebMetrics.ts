import fs from "fs";

class UmamiClient {
  private username: string;
  private password: string;
  private token: string | null = null;
  private baseUrl: string;

  constructor(username: string, password: string, baseUrl: string) {
    this.username = username;
    this.password = password;
    this.baseUrl = baseUrl;
  }

  async login() {
    const loginData = {
      username: this.username,
      password: this.password,
    };

    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.token = data.token;
    console.log("Login successful, token stored.");
    // output the data to a json file for debugging or caching token
    fs.writeFileSync("scripts/umami.json", JSON.stringify(data, null, 2));
    return data;
  }

  async checkToken() {
    // load the token from the umami.json file
    const authData = JSON.parse(fs.readFileSync("scripts/umami.json", "utf8"));
    this.token = authData.token;
    const response = await fetch(`${this.baseUrl}/api/auth/verify`, {
      headers: {
        "Authorization": `Bearer ${this.token}`,
      },
    });
    const data = await response.json();
    if (data.username === "admin" && data.isAdmin === true && data.role === "admin") {
      return true;
    }
    return false;
  }

  async getWebsites() {
    const isTokenValid = await this.checkToken();
    if (!isTokenValid) {
      await this.login();
    }
    const response = await fetch(`${this.baseUrl}/api/websites`, {
      headers: {
        "Authorization": `Bearer ${this.token}`,
      },
    });

    const data = await response.json();
    return data;
  }

  async getWebsitePageviews(websiteId: string) {
    const isTokenValid = await this.checkToken();
    if (!isTokenValid) {
      await this.login();
    }
    const response = await fetch(`${this.baseUrl}/api/websites/${websiteId}/pageviews?startAt=1746921600000&endAt=1747008000000&unit=day&timezone=Asia/Seoul`, {
      headers: {
        "Authorization": `Bearer ${this.token}`,
      },
    });
    const data = await response.json();
    return data;
  }

  async getWebsiteStats(websiteId: string) {
    const isTokenValid = await this.checkToken();
    if (!isTokenValid) {
      await this.login();
    }
    const response = await fetch(`${this.baseUrl}/api/websites/${websiteId}/stats?startAt=1746921600000&endAt=1747008000000&unit=day&timezone=Asia/Seoul`, {
      headers: {
        "Authorization": `Bearer ${this.token}`,
      },
    });
    const data = await response.json();
    return data;
  }
  

  async getWebsiteMetrics(websiteId: string, type: string) {
    const isTokenValid = await this.checkToken();
    if (!isTokenValid) {
      await this.login();
    }

    const response = await fetch(`${this.baseUrl}/api/websites/${websiteId}/metrics?startAt=1746921600000&endAt=1747008000000&unit=day&timezone=Asia/Seoul&type=${type}`, {
      headers: {
        "Authorization": `Bearer ${this.token}`,
      },
    });
    const data = await response.json();
    return data;
  }
}

async function getWebMetrics() {
  const client = new UmamiClient(process.env.UMAMI_USERNAME!, process.env.UMAMI_PASSWORD!, process.env.UMAMI_BASE_URL!);
  const websites = await client.getWebsiteMetrics("ae21f682-27e8-4670-bf7f-8eec7a2097cf", "url");
  console.log(websites);
}

getWebMetrics();
