import {Router} from "express";
import {AnnouncementController} from "../controllers/AnnouncementController";
import {verifyResourceAuthority, verifyToken} from "../middlewares/auth.middlewares";
import {IAnnouncementService} from "../services/IAnnouncementService";
import {validateParams} from "../middlewares/validator.middlewares";
import {
    AnnouncementIdPathSchema,
} from "../schemas/announcement.schemas";

/**
 * Creates and configures announcement management routes
 *
 * Provides a complete CRUD API for announcement management with:
 * - JWT authentication
 * - Role-Based Access Control (RBAC)
 * - Request validation
 * - Comprehensive error handling
 *
 * All endpoints require valid JWT and appropriate permissions.
 *
 */
export function createAnnouncementRoutes(announcementService: IAnnouncementService) {
    // Initialize a router instance
    const controller = new AnnouncementController(announcementService);
    const router = Router();

    router.route("/")
        .all(verifyToken)
        .post(
            verifyResourceAuthority("Announcement", "CREATE"),
            controller.createAnnouncement
        )
        .get(
            verifyResourceAuthority("Announcement", "READ"),
            controller.getAllAnnouncements
        )

    router.route("/:id")
        .all(
            verifyToken,
            validateParams(AnnouncementIdPathSchema)
        )
        .get(
            verifyResourceAuthority("Announcement", "READ"),
            controller.getAnnouncementById
        )
        .put(
            verifyResourceAuthority("Announcement", "UPDATE"),
            controller.updateAnnouncement
        )
        .delete(
            verifyResourceAuthority("Announcement", "DELETE"),
            controller.deleteAnnouncement
        )

    return router;
}