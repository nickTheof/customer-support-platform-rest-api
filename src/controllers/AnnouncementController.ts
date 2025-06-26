import catchAsync from "../core/utils/catchAsync";
import {Request, Response, NextFunction} from "express";
import {uploadFiles} from "../middlewares/upload.middleware";
import {UserTokenPayload} from "../core/interfaces/user.interfaces";
import {IAnnouncementService} from "../services/IAnnouncementService";
import {
    AnnouncementAttachInfoDTO,
    AnnouncementInsertDTO,
    AnnouncementReadOnlyDTO,
    AnnouncementUpdateDTO
} from "../core/types/zod-model.types";
import {sendResponse} from "../core/utils/sendResponses";
import {AnnouncementInsertDTOSchema, AnnouncementUpdateDTOSchema} from "../schemas/announcement.schemas";
import {AppValidationException} from "../core/exceptions/app.exceptions";
import {ZodError} from "zod/v4";

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
        try {
            AnnouncementInsertDTOSchema.parse(dto)
        } catch (err) {
            return next(new AppValidationException("Announcement", err as ZodError));
        }
        const files = req.files as Express.Multer.File[] || [];
        const savedAnnouncementDTO: AnnouncementReadOnlyDTO = await this.announcementService.createAnnouncement(dto, files, user)
        sendResponse<AnnouncementReadOnlyDTO>(savedAnnouncementDTO, 201, res)
    });

    getAllAnnouncements = catchAsync(async (_req: Request, res: Response) => {
        const data: AnnouncementAttachInfoDTO[] = await this.announcementService.getAllAnnouncements();
        sendResponse<AnnouncementAttachInfoDTO>(data, 200, res)
    })

    getAnnouncementById = catchAsync(async (req: Request, res: Response) => {
        const announcementId = req.params.id;
        const data: AnnouncementAttachInfoDTO = await this.announcementService.getAnnouncementById(announcementId);
        sendResponse<AnnouncementAttachInfoDTO>(data, 200, res)
    })

    deleteAnnouncement = catchAsync(async (req: Request, res: Response) => {
        const announcementId = req.params.id;
        await this.announcementService.deleteAnnouncementById(announcementId);
        sendResponse(null, 204, res)
    })

    updateAnnouncement = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const announcementId = req.params.id;
        // Handle files uploading. If all goes right, we proceed
        try {
            await uploadFiles()(req, res);
        } catch (err) {
            return next(err);
        }
        const dto = req.body as AnnouncementUpdateDTO;
        try {
            AnnouncementUpdateDTOSchema.parse(dto)
        } catch (err) {
            return next(new AppValidationException("Announcement", err as ZodError));
        }
        const files = req.files as Express.Multer.File[] || [];
        const data: AnnouncementReadOnlyDTO = await this.announcementService.updateAnnouncement(announcementId, dto, files);
        sendResponse<AnnouncementReadOnlyDTO>(data, 200, res)
    })
}