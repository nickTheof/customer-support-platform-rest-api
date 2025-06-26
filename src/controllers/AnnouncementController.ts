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


/**
* Announcement Controller
*
*  Handles all announcement-related operations including:
 *  - Creating announcements with attachments
* - Managing announcement lifecycle
* - Handling file uploads and validation
*/
export class AnnouncementController {
    constructor(private announcementService: IAnnouncementService) {
    }

    /**
     * Create a new announcement with attachments
     */
    createAnnouncement = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
        const user = res.locals.user as UserTokenPayload;
        // Process file uploads
        await uploadFiles()(req, res);

        const dto = req.body as AnnouncementInsertDTO;
        // Validate request body
        try {
            AnnouncementInsertDTOSchema.parse(dto)
        } catch (err) {
            throw new AppValidationException("Announcement", err as ZodError);
        }
        const files = req.files as Express.Multer.File[] || [];
        const savedAnnouncementDTO: AnnouncementReadOnlyDTO = await this.announcementService.createAnnouncement(dto, files, user)
        sendResponse<AnnouncementReadOnlyDTO>(savedAnnouncementDTO, 201, res)
    });

    /**
     * Get all announcements
     */
    getAllAnnouncements = catchAsync(async (_req: Request, res: Response) => {
        const data: AnnouncementAttachInfoDTO[] = await this.announcementService.getAllAnnouncements();
        sendResponse<AnnouncementAttachInfoDTO>(data, 200, res)
    })

    /**
     * Get an announcement by ID
     */
    getAnnouncementById = catchAsync(async (req: Request, res: Response) => {
        const announcementId = req.params.id;
        const data: AnnouncementAttachInfoDTO = await this.announcementService.getAnnouncementById(announcementId);
        sendResponse<AnnouncementAttachInfoDTO>(data, 200, res)
    })

    /**
     * Delete an announcement by ID
     */
    deleteAnnouncement = catchAsync(async (req: Request, res: Response) => {
        const announcementId = req.params.id;
        await this.announcementService.deleteAnnouncementById(announcementId);
        sendResponse(null, 204, res)
    })

    /**
     * Update an announcement with attachments
     */
    updateAnnouncement = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
        const announcementId = req.params.id;

        // Process file uploads
        await uploadFiles()(req, res);

        // Validate request body
        const dto = req.body as AnnouncementUpdateDTO;
        try {
            AnnouncementUpdateDTOSchema.parse(dto)
        } catch (err) {
            throw new AppValidationException("Announcement", err as ZodError);
        }
        const files = req.files as Express.Multer.File[] || [];
        const data: AnnouncementReadOnlyDTO = await this.announcementService.updateAnnouncement(announcementId, dto, files);
        sendResponse<AnnouncementReadOnlyDTO>(data, 200, res)
    })
}