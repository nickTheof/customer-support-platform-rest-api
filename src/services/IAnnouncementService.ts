import {AnnouncementInsertDTO, AnnouncementReadOnlyDTO} from "../core/types/zod-model.types";
import {UserTokenPayload} from "../core/interfaces/user.interfaces";

export interface IAnnouncementService {
    createAnnouncement(dto: AnnouncementInsertDTO, files: Express.Multer.File[], user: UserTokenPayload): Promise<AnnouncementReadOnlyDTO>;
}