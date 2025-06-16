import {z} from "zod/v4";
import {objectIdSchema} from "./user.schemas";
import {TICKET_STATUSES} from "../core/interfaces/ticket.interfaces";

export const CommentInsertDTOSchema = z.object({
    text: z.string().min(1, "Text is required"),
    authorId: objectIdSchema,
});

export const TicketInsertDTOSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    attachments: z.array(objectIdSchema).optional(),
    comments: z.array(CommentInsertDTOSchema).optional(),
    status: z.enum(TICKET_STATUSES).optional(),
});