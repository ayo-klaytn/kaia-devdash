"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Upload, Plus, CheckCircle2, XCircle, Loader2, Settings } from "lucide-react";
import Papa from "papaparse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

export function ManageXPostsModal() {
  const [open, setOpen] = useState(false);
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
      if (!formData.title || !formData.url || !formData.date) {
        throw new Error("Title, URL, and Date are required");
      }

      if (!formData.url.includes("/status/")) {
        throw new Error("URL must be a valid X/Twitter post URL");
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

      // Refresh the page after a short delay to show new posts
      setTimeout(() => {
        window.location.reload();
      }, 1500);
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

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : "Failed to process CSV file");
    } finally {
      setCsvLoading(false);
      e.target.value = "";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Manage X Posts
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-2xl">Manage X/Twitter Posts</SheetTitle>
            <SheetDescription className="text-sm mt-2">
              Add individual posts or upload a CSV file to update the developer content
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Single Post Form */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  Add Single Post
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Fill out the form below to add a new post or update an existing one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Kaia v2.1.0 Announcement"
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-medium">
                      Post URL <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => handleInputChange("url", e.target.value)}
                      placeholder="https://x.com/BuildonKaia/status/1983081299431858612"
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium">
                        Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        className="h-10"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium">
                        Type <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleInputChange("type", value as PostType)}
                      >
                        <SelectTrigger id="type" className="h-10">
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
                      <Label htmlFor="views" className="text-sm font-medium">Views</Label>
                      <Input
                        id="views"
                        value={formData.views}
                        onChange={(e) => handleInputChange("views", e.target.value)}
                        placeholder="9k"
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="likes" className="text-sm font-medium">Likes</Label>
                      <Input
                        id="likes"
                        type="number"
                        value={formData.likes}
                        onChange={(e) => handleInputChange("likes", e.target.value)}
                        placeholder="40"
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retweets" className="text-sm font-medium">Retweets</Label>
                      <Input
                        id="retweets"
                        type="number"
                        value={formData.retweets}
                        onChange={(e) => handleInputChange("retweets", e.target.value)}
                        placeholder="14"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="comments" className="text-sm font-medium">Comments</Label>
                      <Input
                        id="comments"
                        type="number"
                        value={formData.comments}
                        onChange={(e) => handleInputChange("comments", e.target.value)}
                        placeholder="3"
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account" className="text-sm font-medium">Account</Label>
                      <Input
                        id="account"
                        value={formData.account}
                        onChange={(e) => handleInputChange("account", e.target.value)}
                        placeholder="BuildonKaia"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive">
                      <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                      <span className="text-sm">{success}</span>
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full h-10 font-medium">
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
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Upload className="w-4 h-4 text-primary" />
                  </div>
                  Upload CSV File
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Upload a CSV file with multiple posts to process them all at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="csv-file" className="text-sm font-medium">CSV File</Label>
                  <div className="relative">
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      disabled={csvLoading}
                      className="cursor-pointer h-10 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
                    <p className="text-xs text-muted-foreground font-medium mb-1">CSV Format:</p>
                    <p className="text-xs text-muted-foreground">
                      Required: <span className="font-mono">Title, URL, Date, Type</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Optional: <span className="font-mono">Views, Likes, Retweets, Comments, Account</span>
                    </p>
                  </div>
                </div>

                {csvError && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive">
                    <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <span className="text-sm">{csvError}</span>
                  </div>
                )}

                {csvSuccess && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                    <span className="text-sm">{csvSuccess}</span>
                  </div>
                )}

                {csvLoading && (
                  <div className="flex items-center justify-center gap-3 p-6 rounded-lg border border-dashed bg-muted/30">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground font-medium">Processing CSV...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

