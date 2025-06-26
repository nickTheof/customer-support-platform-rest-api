import {IAttachmentDocument} from "../core/interfaces/attachment.interfaces";
import {ClientSession} from "mongoose";

export interface IAttachmentRepository {
    getAll(): Promise<IAttachmentDocument[]>
    getById(id: string): Promise<IAttachmentDocument | null>
    create(attachment: Partial<IAttachmentDocument>, session?: ClientSession): Promise<IAttachmentDocument>
    updateById(id: string, attachment: Partial<IAttachmentDocument>): Promise<IAttachmentDocument | null>
    deleteById(id: string, session?: ClientSession): Promise<IAttachmentDocument | null>
}