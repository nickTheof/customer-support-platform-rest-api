import mongoose from "mongoose";
import { Role } from "../models/role.model";
import { AUTHORITY_ACTIONS, RESOURCES } from "../core/interfaces/role.interfaces";
import env_config from "../core/env_config";
import logger from "../core/utils/logger";

const adminAuthorities = RESOURCES.map((resource) => ({
    resource,
    actions: AUTHORITY_ACTIONS,
}));

/**
 * For specific actions, we will implement an authorization strategy:
 * dedicated middleware will verify that the user has the required authorities,
 * or is the owner of the relevant resource.
 */

const employeeAuthorities = [
    { resource: "Ticket", actions: ["READ", "UPDATE"] },
    { resource: "Announcement", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "Attachment", actions: ["CREATE", "READ"]}
];

const clientAuthorities = [
    { resource: "Ticket", actions: ["CREATE"] },
    { resource: "Announcement", actions: ["READ"] },
    { resource: "Attachment", actions: ["CREATE", "READ"]}
];

const roles = [
    { name: "ADMIN", authorities: adminAuthorities },
    { name: "EMPLOYEE", authorities: employeeAuthorities },
    { name: "CLIENT", authorities: clientAuthorities },
];

async function seedRoles() {
    for (const roleData of roles) {
        // Upsert to avoid duplicates
        await Role.updateOne(
            { name: roleData.name },
            { $set: roleData },
            { upsert: true }
        );
        logger.info(`Seeded role: ${roleData.name}`);
    }
}

// 3. Connect to DB and run
mongoose.connect(`mongodb+srv://${env_config.MONGODB_USER}:${env_config.MONGODB_PASSWORD}@${env_config.MONGODB_CLUSTER_URI}${env_config.MONGODB_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`)
    .then(async () => {
        await seedRoles();
        logger.info("All roles seeded");
        process.exit(0);
    })
    .catch((err) => {
        logger.error("Seeding failed:", err);
        process.exit(1);
    });
