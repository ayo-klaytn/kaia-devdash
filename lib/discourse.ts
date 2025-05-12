export class DiscourseClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getCategories() {
    const response = await fetch(`${this.baseUrl}/categories.json`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  }

  async getLatestPosts() {
    const response = await fetch(`${this.baseUrl}/posts.json`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  }

  async getLatestTopics() {
    const response = await fetch(`${this.baseUrl}/latest.json`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  }

  async getPublicListOfUsers(period: string) {
    const response = await fetch(`${this.baseUrl}/directory_items.json?period=${period}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  }

  async getAbout() {
    const response = await fetch(`${this.baseUrl}/about.json`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  }
}