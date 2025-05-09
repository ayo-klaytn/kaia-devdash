import {
  boolean,
  timestamp,
  pgTable,
  text,
  integer,
  jsonb,
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
  username: text("username").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
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
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repository.id, { onDelete: "cascade" }),
  committerName: text("committer_name").notNull(),
  committerEmail: text("committer_email").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  rawResponse: json("raw_response"),
});

// Developer
export const developer = pgTable("developer", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  github: text("github").notNull(),
  address: text("address").notNull(),
  communityRank: integer("community_rank").notNull(),
  xHandle: text("x_handle"),
  bootcampGraduated: timestamp("bootcamp_graduated"),
  bootcampContributor: timestamp("bootcamp_contributor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Project Repository
export const projectRepository = pgTable("project_repository", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  projectId: integer("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Project
export const project = pgTable("project", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  twitter: text("twitter"),
  github: text("github"),
  communityRank: integer("community_rank").notNull(),
  maturityRank: integer("maturity_rank").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Logs
export const log = pgTable("log", {
  id: text("id").primaryKey(),
  logCode: text("log_code").notNull(),
  message: text("message").notNull(),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

