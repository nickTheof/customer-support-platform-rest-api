import {IAnnouncementDocument} from "../core/interfaces/announcement.interfaces";

export interface IAnnouncementRepository {
    getAll(): Promise<IAnnouncementDocument[]>;
    getById(id: string): Promise<IAnnouncementDocument | null>;
    create(announcement: Partial<IAnnouncementDocument>): Promise<IAnnouncementDocument>;
    updateById(id: string, announcement: Partial<IAnnouncementDocument>): Promise<IAnnouncementDocument | null>;
    deleteById(id: string): Promise<IAnnouncementDocument | null>;
}