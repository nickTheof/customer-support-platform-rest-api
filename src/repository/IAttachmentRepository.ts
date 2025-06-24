import {IAttachmentDocument} from "../core/interfaces/attachment.interfaces";

export interface IAttachmentRepository {
    getAll(): Promise<IAttachmentDocument[]>
    getById(id: string): Promise<IAttachmentDocument | null>
    create(attachment: Partial<IAttachmentDocument>): Promise<IAttachmentDocument>
    updateById(id: string, attachment: Partial<IAttachmentDocument>): Promise<IAttachmentDocument | null>
    deleteById(id: string): Promise<IAttachmentDocument | null>
}