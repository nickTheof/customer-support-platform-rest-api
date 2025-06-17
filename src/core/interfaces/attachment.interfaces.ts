import {Document, Types} from 'mongoose';

export interface IAttachmentDocument extends Document<Types.ObjectId> {
    fileName: string;
    savedName: string;
    filePath: string;
    contentType: string;
    fileExtension: string;
    createdAt: Date;
    updatedAt: Date;
}