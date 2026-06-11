import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 128 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ slugIdx: uniqueIndex("idx_tenants_slug").on(table.slug) }));

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ tenantIdx: index("idx_projects_tenant").on(table.tenantId) }));

export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  sceneGraph: jsonb("scene_graph").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("queued"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("queued"),
  idempotencyKey: varchar("idempotency_key", { length: 256 }).notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ workflowIdx: index("idx_jobs_workflow").on(table.workflowId), idemIdx: uniqueIndex("idx_jobs_idempotency").on(table.idempotencyKey) }));

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "set null" }),
  type: varchar("type", { length: 32 }).notNull(),
  bucket: text("bucket").notNull(),
  objectKey: text("object_key").notNull(),
  checksumSha256: varchar("checksum_sha256", { length: 64 }).notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ objectIdx: uniqueIndex("idx_assets_bucket_object").on(table.bucket, table.objectKey) }));

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  correlationId: uuid("correlation_id").notNull(),
  payload: jsonb("payload").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({ workflowIdx: index("idx_events_workflow").on(table.workflowId) }));

export const publishTargets = pgTable("publish_targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  config: jsonb("config").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const publishJobs = pgTable("publish_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  publishTargetId: uuid("publish_target_id").references(() => publishTargets.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("queued"),
  idempotencyKey: varchar("idempotency_key", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ idemIdx: uniqueIndex("idx_publish_jobs_idempotency").on(table.idempotencyKey) }));

export const publishEvents = pgTable("publish_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  publishJobId: uuid("publish_job_id").references(() => publishJobs.id, { onDelete: "cascade" }).notNull(),
  correlationId: uuid("correlation_id").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ publishJobIdx: index("idx_publish_events_job").on(table.publishJobId) }));
