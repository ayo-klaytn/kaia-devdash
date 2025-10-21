import {
  boolean,
  timestamp,
  pgTable,
  text,
  integer,
  json
} from "drizzle-orm/pg-core";


// User
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Session
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Account
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Verification
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});


// Sub ecosystem
export const subEcosystem = pgTable("sub_ecosystem", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Github Organization
export const githubOrganization = pgTable("github_organization", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Repository
export const repository = pgTable("repository", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  url: text("url"),
  status: text("status").default("inactive"),
  remark: text("remark").default("external"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Repository Stats
export const repositoryStats = pgTable("repository_stats", {
  id: text("id").primaryKey(),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repository.id, { onDelete: "cascade" }),
  stars: integer("stars").notNull().default(0),
  forks: integer("forks").notNull().default(0),
  watchers: integer("watchers").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Contributor
export const contributor = pgTable("contributor", {
  id: text("id").primaryKey(),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repository.id, { onDelete: "cascade" }),
  contributorId: text("contributor_id"),
  contributorNodeId: text("contributor_node_id"),
  username: text("username"),
  email: text("email"),
  htmlUrl: text("html_url"),
  profilePictureUrl: text("profile_picture_url"),
  accountType: text("account_type"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  rawResponse: json("raw_response"),
});

// Repository Contributors (junction table)
export const repositoryContributors = pgTable("repository_contributors", {
  id: text("id").primaryKey(),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repository.id, { onDelete: "cascade" }),
  contributorId: text("contributor_id")
    .notNull()
    .references(() => contributor.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Commit
export const commit = pgTable("commit", {
  id: text("id").primaryKey(),
  sha: text("sha"),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repository.id, { onDelete: "cascade" }),
  committerName: text("committer_name"),
  committerEmail: text("committer_email"),
  timestamp: text("timestamp"),
  url: text("url"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  rawResponse: json("raw_response"),
});

// Developer
export const developer = pgTable("developer", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  github: text("github").notNull(),
  address: text("address"),
  communityRank: integer("community_rank"),
  xHandle: text("x_handle"),
  bootcampGraduated: timestamp("bootcamp_graduated"),
  bootcampContributor: timestamp("bootcamp_contributor"),
  nftBadges: json("nft_badges"),
  ownerOf: json("owner_of"),
  contributorIn: json("contributor_in"),
  commitsIn: json("commits_in"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Project Repository
export const projectRepository = pgTable("project_repository", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  projectId: integer("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Project Dune Dashboard
export const projectDuneDashboard = pgTable("project_dune_dashboard", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  description: text("description").notNull(),
  width: text("width").notNull(),
  height: text("height").notNull(),
  projectId: integer("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Project
export const project = pgTable("project", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  url: text("url"),
  twitter: text("twitter"),
  github: text("github"),
  communityRank: integer("community_rank"),
  maturityRank: integer("maturity_rank"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Logs
export const log = pgTable("log", {
  id: text("id").primaryKey(),
  logCode: text("log_code").notNull(),
  message: text("message").notNull(),
  rawData: json("raw_data"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});


// social media
export const socialMedia = pgTable("social_media", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date"),
  impressions: integer("impressions"),
  likes: integer("likes"),
  engagements: integer("engagements"),
  bookmarks: integer("bookmarks"),
  shares: integer("shares"),
  newFollows: integer("new_follows"),
  unfollows: integer("unfollows"),
  replies: integer("replies"),
  reposts: integer("reposts"),
  profileVisits: integer("profile_visits"),
  createPost: integer("create_post"),
  videoViews: integer("video_views"),
  mediaViews: integer("media_views"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Aggregation and summary tables for performance
export const developerSummary = pgTable("developer_summary", {
  id: text("id").primaryKey(),
  window: text("window").notNull(), // e.g., '28d', '365d'
  email: text("email"),
  displayName: text("display_name"),
  commitCount: integer("commit_count").notNull().default(0),
  repoCount: integer("repo_count").notNull().default(0),
  firstCommitAt: timestamp("first_commit_at"),
  lastCommitAt: timestamp("last_commit_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const repoSummary = pgTable("repo_summary", {
  id: text("id").primaryKey(),
  window: text("window").notNull(),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repository.id, { onDelete: "cascade" }),
  fullName: text("full_name"), // owner/name
  commitCount: integer("commit_count").notNull().default(0),
  developerCount: integer("developer_count").notNull().default(0),
  lastCommitAt: timestamp("last_commit_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const madCache28d = pgTable("mad_cache_28d", {
  date: text("date").primaryKey(), // YYYY-MM-DD UTC
  uniqueDeveloperCount: integer("unique_developer_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const aggregateJobLog = pgTable("aggregate_job_log", {
  id: text("id").primaryKey(),
  jobName: text("job_name").notNull(),
  status: text("status").notNull(), // 'success' | 'error'
  message: text("message"),
  startedAt: timestamp("started_at").notNull(),
  finishedAt: timestamp("finished_at").notNull(),
});