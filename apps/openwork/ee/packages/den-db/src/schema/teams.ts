import { relations } from "drizzle-orm"
import { index, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"
import { denTypeIdColumn } from "../columns"
import { MemberTable, OrganizationTable } from "./org"

export const TeamTable = pgTable(
  "team",
  {
    id: denTypeIdColumn("team", "id").notNull().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    organizationId: denTypeIdColumn("organization", "organization_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("team_organization_id").on(table.organizationId),
    uniqueIndex("team_organization_name").on(table.organizationId, table.name),
  ],
)

export const TeamMemberTable = pgTable(
  "team_member",
  {
    id: denTypeIdColumn("teamMember", "id").notNull().primaryKey(),
    teamId: denTypeIdColumn("team", "team_id").notNull(),
    orgMembershipId: denTypeIdColumn("member", "org_membership_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("team_member_team_id").on(table.teamId),
    index("team_member_org_membership_id").on(table.orgMembershipId),
    uniqueIndex("team_member_team_org_membership").on(table.teamId, table.orgMembershipId),
  ],
)

export const teamRelations = relations(TeamTable, ({ many, one }) => ({
  organization: one(OrganizationTable, {
    fields: [TeamTable.organizationId],
    references: [OrganizationTable.id],
  }),
  memberships: many(TeamMemberTable),
}))

export const teamMemberRelations = relations(TeamMemberTable, ({ one }) => ({
  team: one(TeamTable, {
    fields: [TeamMemberTable.teamId],
    references: [TeamTable.id],
  }),
  orgMembership: one(MemberTable, {
    fields: [TeamMemberTable.orgMembershipId],
    references: [MemberTable.id],
  }),
}))

export const team = TeamTable
export const teamMember = TeamMemberTable
