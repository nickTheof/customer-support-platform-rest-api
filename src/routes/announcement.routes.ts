import {AnnouncementController} from "../controllers/AnnouncementController";
import {Router} from "express";
import {verifyResourceAuthority, verifyToken} from "../middlewares/auth.middlewares";
import {IAnnouncementService} from "../services/IAnnouncementService";
import {validateParams} from "../middlewares/validator.middlewares";
import {
    AnnouncementIdPathSchema,
} from "../schemas/announcement.schemas";

export function createAnnouncementRoutes(announcementService: IAnnouncementService) {
    const controller = new AnnouncementController(announcementService);
    const router = Router();

    router.route("/")
        .all(verifyToken)
        .post(verifyResourceAuthority("Announcement", "CREATE"), controller.createAnnouncement)
        .get(verifyResourceAuthority("Announcement", "READ"), controller.getAllAnnouncements)
    router.route("/:id")
        .all(verifyToken, validateParams(AnnouncementIdPathSchema))
        .get(verifyResourceAuthority("Announcement", "READ"), controller.getAnnouncementById)
        .put(verifyResourceAuthority("Announcement", "UPDATE"), controller.updateAnnouncement)
        .delete(verifyResourceAuthority("Announcement", "DELETE"), controller.deleteAnnouncement)


    return router;
}