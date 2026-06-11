import { relations } from "drizzle-orm"
import { boolean, index, integer, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"
import { pgEnum } from "drizzle-orm/pg-core"
import { denTypeIdColumn, timestamps } from "../columns"
import { MemberTable, OrganizationTable } from "./org"

export const OrgSubscriptionType = ["inference", "seat"] as const
export const OrgSubscriptionStatus = [
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
  "expired",
] as const

export const orgSubscriptionTypeEnum = pgEnum("org_subscription_type", OrgSubscriptionType)
export const orgSubscriptionStatusEnum = pgEnum("org_subscription_status", OrgSubscriptionStatus)

export const OrgSubscriptionTable = pgTable(
  "org_subscriptions",
  {
    id: denTypeIdColumn("orgSubscription", "id").notNull().primaryKey(),
    organization_id: denTypeIdColumn("organization", "organization_id").notNull(),
    created_by_org_membership_id: denTypeIdColumn("member", "created_by_org_membership_id"),
    type: orgSubscriptionTypeEnum("type").notNull(),
    status: orgSubscriptionStatusEnum("status").notNull().default("incomplete"),
    stripe_customer_id: varchar("stripe_customer_id", { length: 255 }).notNull(),
    stripe_subscription_id: varchar("stripe_subscription_id", { length: 255 }).notNull(),
    stripe_price_id: varchar("stripe_price_id", { length: 255 }),
    stripe_subscription_item_id: varchar("stripe_subscription_item_id", { length: 255 }),
    quantity: integer("quantity").notNull().default(0),
    current_period_start: timestamp("current_period_start", { precision: 3 }),
    current_period_end: timestamp("current_period_end", { precision: 3 }),
    cancel_at_period_end: boolean("cancel_at_period_end").notNull().default(false),
    canceled_at: timestamp("canceled_at", { precision: 3 }),
    ended_at: timestamp("ended_at", { precision: 3 }),
    last_event_id: varchar("last_event_id", { length: 255 }),
    ...timestamps,
  },
  (table) => [
    index("org_subscriptions_organization_id").on(table.organization_id),
    index("org_subscriptions_customer_id").on(table.stripe_customer_id),
    uniqueIndex("org_subscriptions_subscription_id").on(table.stripe_subscription_id),
    uniqueIndex("org_subscriptions_org_type").on(table.organization_id, table.type),
    index("org_subscriptions_status").on(table.status),
  ],
)

export const orgSubscriptionRelations = relations(OrgSubscriptionTable, ({ one }) => ({
  organization: one(OrganizationTable, {
    fields: [OrgSubscriptionTable.organization_id],
    references: [OrganizationTable.id],
  }),
  createdByOrgMembership: one(MemberTable, {
    fields: [OrgSubscriptionTable.created_by_org_membership_id],
    references: [MemberTable.id],
  }),
}))

export const orgSubscription = OrgSubscriptionTable
