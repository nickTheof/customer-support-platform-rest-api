import catchAsync from "../core/utils/catchAsync";
import {Request, Response, NextFunction} from "express";
import {uploadFiles} from "../middlewares/upload.middleware";
import {UserTokenPayload} from "../core/interfaces/user.interfaces";
import {IAnnouncementService} from "../services/IAnnouncementService";
import {AnnouncementInsertDTO, AnnouncementReadOnlyDTO} from "../core/types/zod-model.types";
import {sendResponse} from "../core/utils/sendResponses";

export class AnnouncementController {
    constructor(private announcementService: IAnnouncementService) {
    }

    createAnnouncement = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.user as UserTokenPayload;
        // Handle files uploading. If all goes right, we proceed
        try {
            await uploadFiles()(req, res);
        } catch (err) {
            return next(err);
        }
        const dto = req.body as AnnouncementInsertDTO;
        const files = req.files as Express.Multer.File[] || [];
        const savedAnnouncementDTO: AnnouncementReadOnlyDTO = await this.announcementService.createAnnouncement(dto, files, user)
        sendResponse<AnnouncementReadOnlyDTO>(savedAnnouncementDTO, 201, res)
    });
}