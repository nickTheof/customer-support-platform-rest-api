import {z} from "zod/v4";
import {objectIdSchema} from "./user.schemas";

export const AnnouncementInsertDTOSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    authorId: objectIdSchema,
    attachments: z.array(objectIdSchema).optional(),
    viewerStatus: z.array(objectIdSchema).optional()
})