/**
 * Add user to organization with specific role directly in database
 */
// scripts/enhanced-seed-organizations.ts
import { db } from "@/db";
import {
  users,
  organizations,
  members,
  accounts,
  memberExtensions,
  agentOrganizationAssignments,
  frontDeskLocationAssignments,
} from "@/db/schema";

import { HEALTHCARE_ROLES } from "@/lib/permissions/healthcare-permissions-constants";
import { eq, and } from "drizzle-orm";
import { generateId } from "better-auth";
import { SeedOrganization, SeedUser } from "@/types";

/**
 * Enhanced seed script using direct database operations
 * Bypasses Better Auth API calls to avoid authorization issues
 */


// Seed data for organizations and users
const seedData: SeedOrganization[] = [
  {
    name: "5AM Corp",
    slug: "5am-corp",
    type: "admin",
    logo: "https://via.placeholder.com/150/0066CC/FFFFFF?text=5AM",
    metadata: {
      type: "admin",
      contactEmail: "admin@5amcorp.com",
      contactPhone: "+1-555-0100",
      addressLine1: "123 Tech Street",
      addressLine2: "Suite 100",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "USA",
      timezone: "America/Los_Angeles",
      isActive: true,
      settings: {
        features: {
          multiTenant: true,
          advancedReporting: true,
          apiAccess: true,
          customBranding: true,
        },
        billing: {
          plan: "enterprise",
          status: "active",
        },
      },
      hipaaOfficer: "John Smith",
      businessAssociateAgreement: true,
      dataRetentionYears: "7",
    },
    users: [
      {
        email: "superadmin@5amcorp.com",
        name: "Super Admin",
        role: HEALTHCARE_ROLES.SYSTEM_ADMIN,
      },
      {
        email: "admin1@5amcorp.com",
        name: "5AM Admin 1",
        role: HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      },
      {
        email: "admin2@5amcorp.com",
        name: "5AM Admin 2",
        role: HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      },
      {
        email: "agent1@5amcorp.com",
        name: "Agent John",
        role: HEALTHCARE_ROLES.FIVE_AM_AGENT,
      },
      {
        email: "agent2@5amcorp.com",
        name: "Agent Sarah",
        role: HEALTHCARE_ROLES.FIVE_AM_AGENT,
      },
    ],
  },
  {
    name: "Hart Medical Centre",
    slug: "hart-medical-centre",
    type: "client",
    logo: "https://via.placeholder.com/150/009900/FFFFFF?text=HART",
    metadata: {
      type: "client",
      contactEmail: "info@hartmedical.com",
      contactPhone: "+1-555-0200",
      addressLine1: "456 Healthcare Blvd",
      addressLine2: "Building B",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90210",
      country: "USA",
      timezone: "America/Los_Angeles",
      isActive: true,
      settings: {
        features: {
          onlineBooking: true,
          patientPortal: true,
          telemedicine: false,
          mobileApp: true,
        },
        operatingHours: {
          monday: "8:00-18:00",
          tuesday: "8:00-18:00",
          wednesday: "8:00-18:00",
          thursday: "8:00-18:00",
          friday: "8:00-17:00",
          saturday: "9:00-13:00",
          sunday: "closed",
        },
      },
      hipaaOfficer: "Sarah Connor",
      businessAssociateAgreement: true,
      dataRetentionYears: "10",
    },
    users: [
      {
        email: "admin@hartmedical.com",
        name: "Hart Medical Admin",
        role: HEALTHCARE_ROLES.CLIENT_ADMIN,
      },
      {
        email: "admin2@hartmedical.com",
        name: "Hart Medical Admin 2",
        role: HEALTHCARE_ROLES.CLIENT_ADMIN,
      },
      {
        email: "frontdesk1@hartmedical.com",
        name: "Reception Lisa",
        role: HEALTHCARE_ROLES.FRONT_DESK,
      },
      {
        email: "frontdesk2@hartmedical.com",
        name: "Reception Maria",
        role: HEALTHCARE_ROLES.FRONT_DESK,
      },
      {
        email: "tech1@hartmedical.com",
        name: "Technician David",
        role: HEALTHCARE_ROLES.TECHNICIAN,
      },
      {
        email: "tech2@hartmedical.com",
        name: "Technician Susan",
        role: HEALTHCARE_ROLES.TECHNICIAN,
      },
      {
        email: "tech3@hartmedical.com",
        name: "Technician Robert",
        role: HEALTHCARE_ROLES.TECHNICIAN,
      },
      {
        email: "dr.cardiologist1@hartmedical.com",
        name: "Dr. Emily Carter",
        role: HEALTHCARE_ROLES.INTERPRETING_DOCTOR,
      },
      {
        email: "dr.cardiologist2@hartmedical.com",
        name: "Dr. Michael Thompson",
        role: HEALTHCARE_ROLES.INTERPRETING_DOCTOR,
      },
      {
        email: "dr.cardiologist3@hartmedical.com",
        name: "Dr. Jessica Lee",
        role: HEALTHCARE_ROLES.INTERPRETING_DOCTOR,
      },
    ],
  },
];

/**
 * Hash password using a simple method for demo
 * In production, use proper password hashing like bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  // Better Auth will handle proper password hashing when used through API
  // For direct DB operations, we'll use a simple hash (not recommended for production)
  const crypto = await import("crypto");
  return crypto
    .createHash("sha256")
    .update(password + "salt")
    .digest("hex");
}

/**
 * Create a user directly in the database
 */
async function createUserDirect(userData: SeedUser): Promise<string> {
  try {
    console.log(`Creating user: ${userData.email}`);

    const userId = generateId();
    const hashedPassword = await hashPassword(
      userData.password || "TempPassword123!"
    );

    // Insert user into users table
    await db.insert(users).values({
      id: userId,
      name: userData.name,
      email: userData.email,
      emailVerified: true, // Set as verified for seed data
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create account record for email/password authentication
    await db.insert(accounts).values({
      id: generateId(),
      accountId: userData.email,
      providerId: "credential", // For email/password auth
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ User created: ${userData.email} with ID: ${userId}`);
    return userId;
  } catch (error) {
    console.error(`❌ Error creating user ${userData.email}:`, error);
    throw error;
  }
}

/**
 * Create an organization directly in the database
 */
async function createOrganizationDirect(
  orgData: SeedOrganization
): Promise<string> {
  try {
    console.log(`\n📁 Creating organization: ${orgData.name}`);

    const organizationId = generateId();

    // Insert organization into organizations table
    await db.insert(organizations).values({
      id: organizationId,
      name: orgData.name,
      slug: orgData.slug,
      logo: orgData.logo,
      metadata: orgData.metadata,
      createdAt: new Date(),
    });

    console.log(
      `✅ Organization created: ${orgData.name} with ID: ${organizationId}`
    );
    return organizationId;
  } catch (error) {
    console.error(`❌ Error creating organization ${orgData.name}:`, error);
    throw error;
  }
}

/**
 * Add user to organization with specific role directly in database
 */
async function addUserToOrganizationDirect(
  userId: string,
  organizationId: string,
  role: string,
  userEmail: string
): Promise<string> {
  try {
    console.log(`Adding user ${userEmail} to organization with role: ${role}`);

    const memberId = generateId();

    // Insert member record
    await db.insert(members).values({
      id: memberId,
      organizationId: organizationId,
      userId: userId,
      role: role,
      createdAt: new Date(),
    });

    console.log(
      `✅ User ${userEmail} added to organization with role: ${role}`
    );
    return memberId;
  } catch (error) {
    console.error(`❌ Error adding user ${userEmail} to organization:`, error);
    throw error;
  }
}

/**
 * Create member extensions for agents with assigned organizations
 */
async function createMemberExtensions(
  memberId: string,
  userId: string,
  organizationId: string,
  role: string,
  assignedOrgIds: string[] = [],
  systemAdminId: string
): Promise<void> {
  try {
    console.log(`Creating member extensions for role: ${role}`);

    // Create basic member extension record
    const memberExtensionId = generateId();
    await db.insert(memberExtensions).values({
      id: memberExtensionId,
      memberId: memberId,
      userId: userId,
      organizationId: organizationId,
      assignedOrganizations: assignedOrgIds,
      assignedLocationIds: [],
      availabilitySettings:
        role === HEALTHCARE_ROLES.INTERPRETING_DOCTOR
          ? {
              weekdayHours: { start: "08:00", end: "18:00" },
              weekendHours: { start: "09:00", end: "17:00" },
              emergencyAvailable: true,
              maxConcurrentAssignments: 5,
            }
          : role === HEALTHCARE_ROLES.TECHNICIAN
            ? {
                weekdayHours: { start: "07:00", end: "19:00" },
                weekendHours: { start: "08:00", end: "16:00" },
                emergencyAvailable: false,
                maxConcurrentAssignments: 8,
              }
            : {},
      roleSpecificData: {},
      createdBy: systemAdminId,
      updatedBy: systemAdminId,
    });

    // Handle agent assignments
    if (role === HEALTHCARE_ROLES.FIVE_AM_AGENT && assignedOrgIds.length > 0) {
      console.log(
        `Creating agent assignments for organizations: ${assignedOrgIds.join(", ")}`
      );

      for (const clientOrgId of assignedOrgIds) {
        const assignmentId = generateId();
        await db.insert(agentOrganizationAssignments).values({
          id: assignmentId,
          agentUserId: userId,
          agentOrganizationId: organizationId, // 5AM Corp
          clientOrganizationId: clientOrgId, // Hart Medical, etc.
          accessLevel: "standard",
          isActive: true,
          assignedAt: new Date(),
          createdBy: systemAdminId,
          updatedBy: systemAdminId,
        });
      }
    }

    // Handle front desk location assignments (placeholder - would need actual location IDs)
    if (role === HEALTHCARE_ROLES.FRONT_DESK) {
      console.log(
        `Creating front desk location assignments for user: ${userId}`
      );
      // Note: This would require actual procedure location IDs from your procedure_test_locations table
      // For now, we'll just create the member extension record
    }

    console.log(`✅ Member extensions created for role: ${role}`);
  } catch (error) {
    console.error(`❌ Error creating member extensions:`, error);
    throw error;
  }
}

/**
 * Main seeding function
 */
export async function seedOrganizations(): Promise<void> {
  try {
    console.log("🌱 Starting enhanced database seeding...");

    // Track created organization IDs and user IDs
    const createdOrgIds: { [key: string]: string } = {};
    const createdUserIds: { [key: string]: string } = {};
    let systemAdminId = "";

    // Create organizations and users
    for (const orgData of seedData) {
      // Create organization
      const organizationId = await createOrganizationDirect(orgData);
      createdOrgIds[orgData.slug] = organizationId;

      // Create users and add them to organization
      for (const userData of orgData.users) {
        const userId = await createUserDirect(userData);
        const memberId = await addUserToOrganizationDirect(
          userId,
          organizationId,
          userData.role,
          userData.email
        );

        // Track system admin for audit purposes
        if (userData.role === HEALTHCARE_ROLES.SYSTEM_ADMIN) {
          systemAdminId = userId;
        }

        createdUserIds[userData.email] = userId;

        // Create member extensions
        const clientOrgIds =
          userData.role === HEALTHCARE_ROLES.FIVE_AM_AGENT
            ? Object.entries(createdOrgIds)
                .filter(
                  ([slug, _]) =>
                    seedData.find((org) => org.slug === slug)?.type === "client"
                )
                .map(([_, id]) => id)
            : [];

        await createMemberExtensions(
          memberId,
          userId,
          organizationId,
          userData.role,
          clientOrgIds,
          systemAdminId || userId // Use system admin if available, otherwise self
        );
      }
    }

    console.log("\n🎉 Seeding completed successfully!");
    console.log("\n📋 Created accounts (email/password):");
    console.log("Super Admin: superadmin@5amcorp.com / TempPassword123!");
    console.log("5AM Admin: admin1@5amcorp.com / TempPassword123!");
    console.log("5AM Agent: agent1@5amcorp.com / TempPassword123!");
    console.log("Hart Admin: admin@hartmedical.com / TempPassword123!");
    console.log("Front Desk: frontdesk1@hartmedical.com / TempPassword123!");
    console.log("Technician: tech1@hartmedical.com / TempPassword123!");
    console.log("Doctor: dr.cardiologist1@hartmedical.com / TempPassword123!");

    console.log("\n🔗 Organization assignments:");
    console.log("- 5AM Agents have access to all client organizations");
    console.log(
      "- Client organization members can only access their own organization"
    );
    console.log(
      "- Front desk users can be assigned to specific procedure locations"
    );
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    throw error;
  }
}

/**
 * Cleanup function to remove all seeded data (for testing)
 */
export async function cleanupSeedData(): Promise<void> {
  try {
    console.log("🧹 Cleaning up seed data...");

    // Delete in reverse order due to foreign key constraints

    // Delete agent organization assignments
    for (const orgData of seedData) {
      for (const userData of orgData.users) {
        if (userData.role === HEALTHCARE_ROLES.FIVE_AM_AGENT) {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, userData.email));
          if (user.length > 0) {
            await db
              .delete(agentOrganizationAssignments)
              .where(eq(agentOrganizationAssignments.agentUserId, user[0].id));
            console.log(
              `✅ Deleted agent assignments for user: ${userData.email}`
            );
          }
        }
      }
    }

    // Delete front desk location assignments
    for (const orgData of seedData) {
      for (const userData of orgData.users) {
        if (userData.role === HEALTHCARE_ROLES.FRONT_DESK) {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, userData.email));
          if (user.length > 0) {
            await db
              .delete(frontDeskLocationAssignments)
              .where(
                eq(frontDeskLocationAssignments.frontDeskUserId, user[0].id)
              );
            console.log(
              `✅ Deleted front desk assignments for user: ${userData.email}`
            );
          }
        }
      }
    }

    // Delete member extensions
    for (const orgData of seedData) {
      for (const userData of orgData.users) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, userData.email));
        if (user.length > 0) {
          await db
            .delete(memberExtensions)
            .where(eq(memberExtensions.userId, user[0].id));
          console.log(
            `✅ Deleted member extensions for user: ${userData.email}`
          );
        }
      }
    }

    // Delete members
    for (const orgData of seedData) {
      const org = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, orgData.slug));
      if (org.length > 0) {
        await db.delete(members).where(eq(members.organizationId, org[0].id));
        console.log(`✅ Deleted members for organization: ${org[0].name}`);
      }
    }

    // Delete accounts
    for (const orgData of seedData) {
      for (const userData of orgData.users) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, userData.email));
        if (user.length > 0) {
          await db.delete(accounts).where(eq(accounts.userId, user[0].id));
          console.log(`✅ Deleted account for user: ${userData.email}`);
        }
      }
    }

    // Delete users
    for (const orgData of seedData) {
      for (const userData of orgData.users) {
        await db.delete(users).where(eq(users.email, userData.email));
        console.log(`✅ Deleted user: ${userData.email}`);
      }
    }

    // Delete organizations
    for (const orgData of seedData) {
      await db
        .delete(organizations)
        .where(eq(organizations.slug, orgData.slug));
      console.log(`✅ Deleted organization: ${orgData.name}`);
    }

    console.log("✅ Cleanup completed");
  } catch (error) {
    console.error("💥 Cleanup failed:", error);
    throw error;
  }
}

/**
 * Reset function (cleanup + seed)
 */
export async function resetSeedData(): Promise<void> {
  console.log("🔄 Resetting seed data...");
  await cleanupSeedData();
  await seedOrganizations();
  console.log("✅ Reset completed");
}

// Script execution
if (require.main === module) {
  const command = process.argv[2];

  let operation: Promise<void>;

  switch (command) {
    case "clean":
      operation = cleanupSeedData();
      break;
    case "reset":
      operation = resetSeedData();
      break;
    default:
      operation = seedOrganizations();
      break;
  }

  operation
    .then(() => {
      console.log("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}
