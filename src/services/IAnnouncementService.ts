import {
    AnnouncementAttachInfoDTO,
    AnnouncementInsertDTO,
    AnnouncementReadOnlyDTO,
    AnnouncementUpdateDTO
} from "../core/types/zod-model.types";
import {UserTokenPayload} from "../core/interfaces/user.interfaces";

export interface IAnnouncementService {
    createAnnouncement(dto: AnnouncementInsertDTO, files: Express.Multer.File[], user: UserTokenPayload): Promise<AnnouncementReadOnlyDTO>;
    updateAnnouncement(id: string, dto: AnnouncementUpdateDTO, files: Express.Multer.File[]): Promise<AnnouncementReadOnlyDTO>;
    getAllAnnouncements(): Promise<AnnouncementAttachInfoDTO[]>;
    getAnnouncementById(id: string): Promise<AnnouncementAttachInfoDTO>;
    deleteAnnouncementById(id: string): Promise<void>;
}