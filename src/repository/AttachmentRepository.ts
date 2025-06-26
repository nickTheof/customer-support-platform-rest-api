import {IAttachmentRepository} from "./IAttachmentRepository";
import {IAttachmentDocument} from "../core/interfaces/attachment.interfaces";
import {Attachment} from "../models/attachment.model";
import {ClientSession} from "mongoose";

export class AttachmentRepository implements IAttachmentRepository {
    async create(attachment: Partial<IAttachmentDocument>, session?: ClientSession): Promise<IAttachmentDocument> {
        return (await Attachment.create([attachment], {session}))[0]
    }

    async deleteById(id: string, session?: ClientSession): Promise<IAttachmentDocument | null> {
        return (await Attachment.findByIdAndDelete(id, {session}));
    }

    async getAll(): Promise<IAttachmentDocument[]> {
        return (await Attachment.find())
    }

    async getById(id: string): Promise<IAttachmentDocument | null> {
        return (await Attachment.findById(id))
    }

    async updateById(id: string, attachment: Partial<IAttachmentDocument>): Promise<IAttachmentDocument | null> {
        return (await Attachment.findByIdAndUpdate(id, {
            $set: attachment
        }, {
            new: true,
            runValidators: true
        }));
    }

}