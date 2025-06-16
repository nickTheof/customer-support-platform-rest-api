import {Document, Types} from "mongoose";
import {IAttachmentDocument} from "./attachment.interfaces";
import {IUserDocument} from "./user.interfaces";


export interface IAnnouncementDocument extends Document {
    title: string;
    description: string;
    attachments?: Types.ObjectId[] | IAttachmentDocument[];
    authorId: Types.ObjectId| IUserDocument;
    viewerStatus?: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}