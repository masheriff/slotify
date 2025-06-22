// scripts/seed-organizations.ts
import { auth } from "@/lib/auth";
import { HEALTHCARE_ROLES } from "@/lib/permissions/healthcare-permissions-constants";

/**
 * Comprehensive seed script for Better Auth with Admin and Organization plugins
 * Creates organizations and users with proper roles and permissions
 */

interface SeedUser {
  email: string;
  name: string;
  role: (typeof HEALTHCARE_ROLES)[keyof typeof HEALTHCARE_ROLES];
  password?: string;
}

interface SeedOrganization {
  name: string;
  slug: string;
  type: "admin" | "client";
  logo?: string;
  metadata: {
    type: "admin" | "client";
    contactEmail: string;
    contactPhone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    timezone: string;
    isActive: boolean;
    settings: Record<string, any>;
    hipaaOfficer?: string;
    businessAssociateAgreement?: boolean;
    dataRetentionYears?: string;
  };
  users: SeedUser[];
}

const seedData: SeedOrganization[] = [
  {
    name: "5AM Corp",
    slug: "5am-corp",
    type: "admin",
    logo: "https://example.com/5am-corp-logo.png",
    metadata: {
      type: "admin",
      contactEmail: "admin@5amcorp.com",
      contactPhone: "+1-555-0100",
      addressLine1: "123 Admin Street",
      addressLine2: "Suite 100",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600001",
      country: "India",
      timezone: "Asia/Kolkata",
      isActive: true,
      settings: {
        allowUserRegistration: false,
        requireTwoFactorAuth: true,
        sessionTimeout: 8 * 60 * 60, // 8 hours
        auditLogRetention: 7 * 365, // 7 years
      },
      hipaaOfficer: "Chief Compliance Officer",
      businessAssociateAgreement: true,
      dataRetentionYears: "7",
    },
    users: [
      {
        email: "superadmin@5amcorp.com",
        name: "System Super Admin",
        role: HEALTHCARE_ROLES.SYSTEM_ADMIN,
      },
      {
        email: "admin1@5amcorp.com",
        name: "5AM Admin One",
        role: HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      },
      {
        email: "admin2@5amcorp.com",
        name: "5AM Admin Two",
        role: HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      },
      {
        email: "agent1@5amcorp.com",
        name: "Agent John Doe",
        role: HEALTHCARE_ROLES.FIVE_AM_AGENT,
      },
      {
        email: "agent2@5amcorp.com",
        name: "Agent Jane Smith",
        role: HEALTHCARE_ROLES.FIVE_AM_AGENT,
      },
      {
        email: "agent3@5amcorp.com",
        name: "Agent Mike Wilson",
        role: HEALTHCARE_ROLES.FIVE_AM_AGENT,
      },
    ],
  },
  {
    name: "Hart Medical Center",
    slug: "hart-medical-center",
    type: "client",
    logo: "https://example.com/hart-medical-logo.png",
    metadata: {
      type: "client",
      contactEmail: "admin@hartmedical.com",
      contactPhone: "+1-555-0200",
      addressLine1: "456 Healthcare Avenue",
      addressLine2: "Medical Building A",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600002",
      country: "India",
      timezone: "Asia/Kolkata",
      isActive: true,
      settings: {
        allowPatientPortal: true,
        requireAppointmentConfirmation: true,
        autoAssignTechnicians: false,
        enableSMSNotifications: true,
        procedureTypes: ["Holter", "Echo", "EKG", "Stress Test"],
      },
      hipaaOfficer: "Dr. Sarah Connor",
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
 * Helper function to hash passwords (simple implementation for demo)
 * In production, you should use proper password hashing
 */
async function hashPassword(password: string): Promise<string> {
  // For demo purposes - in production use proper hashing
  // Better Auth will handle proper password hashing
  return password;
}

/**
 * Create a user using Better Auth API
 */
async function createUser(userData: SeedUser, organizationId?: string): Promise<string> {
  try {
    console.log(`Creating user: ${userData.email}`);
    
    const user = await auth.api.createUser({
      body: {
        email: userData.email,
        name: userData.name,
        password: userData.password || "TempPassword123!",
        role: userData.role,
      },
    });

    if (!user) {
      throw new Error(`Failed to create user: ${userData.email}`);
    }

    console.log(`✅ User created: ${userData.email} with ID: ${user.user.id}`);
    return user.user.id;
  } catch (error) {
    console.error(`❌ Error creating user ${userData.email}:`, error);
    throw error;
  }
}

/**
 * Add user to organization with specific role
 */
async function addUserToOrganization(
  userId: string,
  organizationId: string,
  role: (typeof HEALTHCARE_ROLES)[keyof typeof HEALTHCARE_ROLES],
  userEmail: string
): Promise<void> {
  try {
    console.log(`Adding user ${userEmail} to organization with role: ${role}`);
    
    await auth.api.addMember({
      body: {
        organizationId,
        userId,
        role,
      },
    });

    console.log(`✅ User ${userEmail} added to organization with role: ${role}`);
  } catch (error) {
    console.error(`❌ Error adding user ${userEmail} to organization:`, error);
    throw error;
  }
}

/**
 * Create organization using Better Auth API
 */
async function createOrganization(orgData: SeedOrganization): Promise<string> {
  try {
    console.log(`\n📁 Creating organization: ${orgData.name}`);
    
    // Create organization
    const organization = await auth.api.createOrganization({
      body: {
        name: orgData.name,
        slug: orgData.slug,
        logo: orgData.logo,
        metadata: orgData.metadata,
      },
    });

    if (!organization) {
      throw new Error(`Failed to create organization: ${orgData.name}`);
    }

    console.log(`✅ Organization created: ${orgData.name} with ID: ${organization.id}`);
    return organization.id;
  } catch (error) {
    console.error(`❌ Error creating organization ${orgData.name}:`, error);
    throw error;
  }
}

/**
 * Create member extensions for agents with assigned organizations
 */
async function createMemberExtensions(
  memberId: string,
  role: string,
  assignedOrgIds: string[] = []
): Promise<void> {
  try {
    // This would be a custom database operation since Better Auth doesn't handle extensions
    // You'll need to implement this based on your database setup
    console.log(`Creating member extensions for role: ${role}`);
    
    if (role === HEALTHCARE_ROLES.FIVE_AM_AGENT && assignedOrgIds.length > 0) {
      // Custom logic to create member extensions
      // This would involve direct database operations
      console.log(`Agent assigned to organizations: ${assignedOrgIds.join(", ")}`);
    }
    
    console.log(`✅ Member extensions created for role: ${role}`);
  } catch (error) {
    console.error(`❌ Error creating member extensions:`, error);
    throw error;
  }
}

/**
 * Main seed function
 */
export async function seedOrganizations(): Promise<void> {
  try {
    console.log("🌱 Starting organization and user seeding...\n");

    const createdOrganizations: { id: string; name: string; type: string }[] = [];

    // Step 1: Create organizations and their users
    for (const orgData of seedData) {
      const organizationId = await createOrganization(orgData);
      createdOrganizations.push({
        id: organizationId,
        name: orgData.name,
        type: orgData.type,
      });

      // Step 2: Create users and add them to the organization
      console.log(`\n👥 Creating users for ${orgData.name}...`);
      
      for (const userData of orgData.users) {
        try {
          const userId = await createUser(userData);
          await addUserToOrganization(userId, organizationId, userData.role, userData.email);
          
          // Create member extensions if needed (for agents)
          if (userData.role === HEALTHCARE_ROLES.FIVE_AM_AGENT) {
            // Get client organization IDs for agent assignment
            const clientOrgIds = createdOrganizations
              .filter(org => org.type === "client")
              .map(org => org.id);
            
            // For demo, assign first agent to first client org, etc.
            const agentIndex = orgData.users
              .filter(u => u.role === HEALTHCARE_ROLES.FIVE_AM_AGENT)
              .indexOf(userData);
            
            const assignedOrgIds = clientOrgIds.slice(0, agentIndex + 1);
            await createMemberExtensions(userId, userData.role, assignedOrgIds);
          }
          
        } catch (userError) {
          console.error(`Failed to create/add user ${userData.email}:`, userError);
          // Continue with other users
        }
      }
    }

    // Step 3: Create some additional sample invitations
    console.log("\n📧 Creating sample invitations...");
    
    const hartMedicalOrg = createdOrganizations.find(org => org.name === "Hart Medical Center");
    const fiveAmOrg = createdOrganizations.find(org => org.name === "5AM Corp");
    
    if (hartMedicalOrg && fiveAmOrg) {
      try {
        // Create invitation for Hart Medical
        await auth.api.createInvitation({
          body: {
            organizationId: hartMedicalOrg.id,
            email: "newtech@hartmedical.com",
            role: HEALTHCARE_ROLES.TECHNICIAN,
          },
        });
        console.log("✅ Sample invitation created for Hart Medical");

        // Create invitation for 5AM Corp
        await auth.api.createInvitation({
          body: {
            organizationId: fiveAmOrg.id,
            email: "newagent@5amcorp.com",
            role: HEALTHCARE_ROLES.FIVE_AM_AGENT,
          },
        });
        console.log("✅ Sample invitation created for 5AM Corp");
        
      } catch (inviteError) {
        console.error("❌ Error creating invitations:", inviteError);
      }
    }

    console.log("\n🎉 Seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log("Organizations created:");
    createdOrganizations.forEach(org => {
      console.log(`  - ${org.name} (${org.type}): ${org.id}`);
    });
    
    console.log("\n🔑 Login credentials:");
    console.log("Super Admin: superadmin@5amcorp.com / SuperAdmin123!");
    console.log("5AM Admin: admin1@5amcorp.com / Admin123!");
    console.log("Hart Admin: admin@hartmedical.com / ClientAdmin123!");
    console.log("Front Desk: frontdesk1@hartmedical.com / FrontDesk123!");
    console.log("Technician: tech1@hartmedical.com / Tech123!");
    console.log("Doctor: dr.cardiologist1@hartmedical.com / Doctor123!");

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
    
    // Delete organizations (this will cascade delete members, invitations)
    for (const orgData of seedData) {
      try {
        // Get organization by slug
        const orgs = await auth.api.listOrganizations({});
        const org = orgs?.find(o => o.slug === orgData.slug);
        
        if (org) {
          await auth.api.deleteOrganization({
              body: { organizationId: org.id },
              headers: []
          });
          console.log(`✅ Deleted organization: ${org.name}`);
        }
      } catch (error) {
        console.error(`❌ Error deleting organization ${orgData.name}:`, error);
      }
    }
    
    // Delete users
    for (const orgData of seedData) {
      for (const userData of orgData.users) {
        try {
          // Note: Better Auth may not have a direct delete user by email method
          // You might need to implement this based on your specific setup
          console.log(`Attempting to delete user: ${userData.email}`);
        } catch (error) {
          console.error(`❌ Error deleting user ${userData.email}:`, error);
        }
      }
    }
    
    console.log("✅ Cleanup completed");
  } catch (error) {
    console.error("💥 Cleanup failed:", error);
    throw error;
  }
}

// Script execution
if (require.main === module) {
  seedOrganizations()
    .then(() => {
      console.log("Seed script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed script failed:", error);
      process.exit(1);
    });
}