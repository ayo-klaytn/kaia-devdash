"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Papa from "papaparse";

type PostType = "Announcement" | "Tutorial" | "Event" | "Technical" | "Integration" | "Workshop";

interface PostFormData {
  title: string;
  url: string;
  views: string;
  likes: string;
  retweets: string;
  comments: string;
  date: string;
  type: PostType;
  account: string;
}

export default function ManageXPostsPage() {
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    url: "",
    views: "",
    likes: "",
    retweets: "",
    comments: "",
    date: new Date().toISOString().split("T")[0],
    type: "Announcement",
    account: "BuildonKaia",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  const handleInputChange = (field: keyof PostFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.url || !formData.date) {
        throw new Error("Title, URL, and Date are required");
      }

      // Validate URL format
      if (!formData.url.includes("/status/")) {
        throw new Error("URL must be a valid X/Twitter post URL (e.g., https://x.com/BuildonKaia/status/1234567890)");
      }

      const response = await fetch("/api/data/x-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            title: formData.title,
            url: formData.url,
            views: formData.views || undefined,
            likes: formData.likes ? parseInt(formData.likes) : undefined,
            retweets: formData.retweets ? parseInt(formData.retweets) : undefined,
            comments: formData.comments ? parseInt(formData.comments) : undefined,
            date: formData.date,
            type: formData.type,
            account: formData.account,
          },
        ]),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add post");
      }

      setSuccess(`Post added successfully! ${result.inserted > 0 ? "New post inserted." : "Existing post updated."}`);
      
      // Reset form
      setFormData({
        title: "",
        url: "",
        views: "",
        likes: "",
        retweets: "",
        comments: "",
        date: new Date().toISOString().split("T")[0],
        type: "Announcement",
        account: "BuildonKaia",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add post");
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvLoading(true);
    setCsvError(null);
    setCsvSuccess(null);

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

    try {
      const text = await file.text();
      
      const parseResult = Papa.parse<CsvRow>(text, {
        header: true,
        skipEmptyLines: true,
      });

      if (parseResult.errors.length > 0) {
        throw new Error(`CSV parsing error: ${parseResult.errors[0].message || "Invalid CSV format"}`);
      }

      const posts = parseResult.data.map((row) => ({
        title: row.Title || row.title || "",
        url: row.URL || row.url || "",
        views: row.Views || row.views || "",
        likes: row.Likes || row.likes || "",
        retweets: row.Retweets || row.retweets || "",
        comments: row.Comments || row.comments || "",
        date: row.Date || row.date || "",
        type: row.Type || row.type || "Announcement",
        account: row.Account || row.account || "BuildonKaia",
      }));

      // Validate posts
      const invalidPosts = posts.filter(
        (p) => !p.title || !p.url || !p.date
      );

      if (invalidPosts.length > 0) {
        throw new Error(
          `${invalidPosts.length} post(s) are missing required fields (Title, URL, Date)`
        );
      }

      const response = await fetch("/api/data/x-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(posts),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload posts");
      }

      setCsvSuccess(
        `Successfully processed ${posts.length} post(s)! ${result.inserted} new, ${result.updated} updated.`
      );
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : "Failed to process CSV file");
    } finally {
      setCsvLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage X/Twitter Posts</h1>
        <p className="text-muted-foreground">
          Add individual posts or upload a CSV file to update the developer content on the X/Twitter page
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Post Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Single Post
            </CardTitle>
            <CardDescription>
              Add one post at a time using the form below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Kaia v2.1.0 Announcement"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">
                  Post URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  placeholder="https://x.com/BuildonKaia/status/1983081299431858612"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value as PostType)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Announcement">Announcement</SelectItem>
                      <SelectItem value="Tutorial">Tutorial</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Integration">Integration</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="views">Views</Label>
                  <Input
                    id="views"
                    value={formData.views}
                    onChange={(e) => handleInputChange("views", e.target.value)}
                    placeholder="9k"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="likes">Likes</Label>
                  <Input
                    id="likes"
                    type="number"
                    value={formData.likes}
                    onChange={(e) => handleInputChange("likes", e.target.value)}
                    placeholder="40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retweets">Retweets</Label>
                  <Input
                    id="retweets"
                    type="number"
                    value={formData.retweets}
                    onChange={(e) => handleInputChange("retweets", e.target.value)}
                    placeholder="14"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Input
                  id="comments"
                  type="number"
                  value={formData.comments}
                  onChange={(e) => handleInputChange("comments", e.target.value)}
                  placeholder="3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Input
                  id="account"
                  value={formData.account}
                  onChange={(e) => handleInputChange("account", e.target.value)}
                  placeholder="BuildonKaia"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{success}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Post...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Post
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* CSV Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload CSV File
            </CardTitle>
            <CardDescription>
              Upload a CSV file with multiple posts at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={csvLoading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                CSV should have columns: Title, URL, Date, Type, Views, Likes, Retweets, Comments, Account
              </p>
            </div>

            {csvError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <XCircle className="w-4 h-4" />
                <span>{csvError}</span>
              </div>
            )}

            {csvSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{csvSuccess}</span>
              </div>
            )}

            {csvLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Processing CSV...</span>
              </div>
            )}

            <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-2">
              <p className="font-semibold">CSV Format Example:</p>
              <pre className="text-xs overflow-x-auto">
{`Title,URL,Views,Likes,Retweets,Comments,Date,Type,Account
Kaia v2.1.0 Announcement,https://x.com/BuildonKaia/status/1983081299431858612,9k,40,14,3,2025-10-28,Announcement,BuildonKaia`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Single Post:</strong> Fill out the form and click &quot;Add Post&quot;. The system will automatically check if the post already exists (by URL) and either insert a new one or update the existing post.
          </p>
          <p>
            • <strong>CSV Upload:</strong> Create a CSV file with your posts and upload it. The system will process all posts and only add new ones (or update existing ones).
          </p>
          <p>
            • <strong>Automatic Updates:</strong> Once added, posts will immediately appear on the X/Twitter dashboard page. No manual refresh needed!
          </p>
          <p>
            • <strong>Duplicate Prevention:</strong> The system uses the post URL to detect duplicates, so you can safely re-upload the same CSV or add the same post multiple times.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

