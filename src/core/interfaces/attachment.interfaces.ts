import {Document} from 'mongoose';

export interface IAttachmentDocument extends Document {
    fileName: string;
    savedName: string;
    filePath: string;
    contentType: string;
    fileExtension: string;
    createdAt: Date;
    updatedAt: Date;
}