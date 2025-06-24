import {IAnnouncementRepository} from "./IAnnouncementRepository";
import {IAnnouncementDocument} from "../core/interfaces/announcement.interfaces";
import {Announcement} from "../models/announcement.model";

export class AnnouncementRepository implements IAnnouncementRepository {
    async create(announcement: Partial<IAnnouncementDocument>): Promise<IAnnouncementDocument> {
        return (await Announcement.create(announcement))
    }

    async deleteById(id: string): Promise<IAnnouncementDocument | null> {
        return (await Announcement.findOneAndDelete({
            _id: id
        }))
    }

    async getAll(): Promise<IAnnouncementDocument[]> {
        return (await Announcement.find())
    }

    async getById(id: string): Promise<IAnnouncementDocument | null> {
        return (await Announcement.findById(id))
    }

    async updateById(id: string, announcement: Partial<IAnnouncementDocument>): Promise<IAnnouncementDocument | null> {
        return (await Announcement.findByIdAndUpdate(id, {
            $set: announcement
        }, {
            new: true,
            runValidators: true
        }))
    }

}