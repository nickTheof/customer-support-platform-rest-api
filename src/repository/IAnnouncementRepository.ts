import {IAnnouncementDocument} from "../core/interfaces/announcement.interfaces";
import {ClientSession} from "mongoose";

export interface IAnnouncementRepository {
    getAll(): Promise<IAnnouncementDocument[]>;
    getById(id: string): Promise<IAnnouncementDocument | null>;
    create(announcement: Partial<IAnnouncementDocument>, session?: ClientSession): Promise<IAnnouncementDocument>;
    updateById(id: string, announcement: Partial<IAnnouncementDocument>, session?: ClientSession): Promise<IAnnouncementDocument | null>;
    deleteById(id: string, session?: ClientSession): Promise<IAnnouncementDocument | null>;
    getAllPopulatedAnnouncements(): Promise<IAnnouncementDocument[]>;
    getByIdPopulated(id: string, session?: ClientSession): Promise<IAnnouncementDocument | null>;
}