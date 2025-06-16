import {Document, Types} from "mongoose";
import {IAttachmentDocument} from "./attachment.interfaces";

export const TICKET_STATUSES = ['OPEN', 'ON_GOING', 'CLOSED'] as const;
export type TicketStatus = typeof TICKET_STATUSES[number];
export interface Comment {
    text: string;
    authorId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITicketDocument extends Document {
    title: string;
    description: string;
    attachments?: Types.ObjectId[] | IAttachmentDocument[];
    comments?: Comment[];
    status: TicketStatus;
    createdAt: Date;
    updatedAt: Date;
}