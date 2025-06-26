import type { 
  users, 
  organizations, 
  members, 
  invitations, 
  sessions, 
  accounts,
  auditLogs,
  memberExtensions,
  agentOrganizationAssignments,
  frontDeskLocationAssignments 
} from '@/db/schema';

// Drizzle inferred types
export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectOrganization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type SelectMember = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;
export type SelectInvitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;
export type SelectSession = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type SelectAccount = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
export type SelectAuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type SelectMemberExtension = typeof memberExtensions.$inferSelect;
export type InsertMemberExtension = typeof memberExtensions.$inferInsert;
export type SelectAgentOrganizationAssignment = typeof agentOrganizationAssignments.$inferSelect;
export type InsertAgentOrganizationAssignment = typeof agentOrganizationAssignments.$inferInsert;
export type SelectFrontDeskLocationAssignment = typeof frontDeskLocationAssignments.$inferSelect;
export type InsertFrontDeskLocationAssignment = typeof frontDeskLocationAssignments.$inferInsert;

// Complex relationship types
export type UserWithOrganizations = SelectUser & {
  organizations: (SelectMember & {
    organization: SelectOrganization;
  })[];
};

// export type OrganizationWithMembers = SelectOrganization & {
//   members: (SelectMember & {
//     user: SelectUser;
//   })[];
// };

export type MemberWithUserAndOrganization = SelectMember & {
  user: SelectUser;
  organization: SelectOrganization;
  extension?: SelectMemberExtension;
};

export type InvitationWithOrganization = SelectInvitation & {
  organization: SelectOrganization;
  inviter: SelectUser;
};
