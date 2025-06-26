import {AnnouncementController} from "../controllers/AnnouncementController";
import {Router} from "express";
import {verifyResourceAuthority, verifyToken} from "../middlewares/auth.middlewares";
import {IAnnouncementService} from "../services/IAnnouncementService";

export function createAnnouncementRoutes(announcementService: IAnnouncementService) {
    const controller = new AnnouncementController(announcementService);
    const router = Router();

    router.post("/", verifyToken, verifyResourceAuthority("Announcement", "CREATE"), controller.createAnnouncement);
    return router;
}