import {z} from "zod/v4";
import {objectIdSchema} from "./user.schemas";

export const AnnouncementInsertDTOSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
})

export const AnnouncementUpdateDTOSchema = AnnouncementInsertDTOSchema.extend({})

// export const AnnouncementInsertDTOSchema = z.object({
//     title: z.string().min(1, "Title is required"),
//     description: z.string().min(1, "Description is required"),
//     authorId: objectIdSchema,
//     attachments: z.array(objectIdSchema).optional(),
//     viewerStatus: z.array(objectIdSchema).optional()
// })

export const AnnouncementReadOnlyDTOSchema = z.object({
    _id: z.string().min(1, "ID is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    author: z.object({
        email: z.email("Email is required"),
    }),
    attachments: z.array(objectIdSchema).optional(),
})

export const AnnouncementAttachInfoDTOSchema = z.object({
    _id: z.string().min(1, "ID is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    author: z.object({
        email: z.email("Email is required"),
    }),
    attachments: z.array(z.object({
        _id: z.string().min(1, "ID is required"),
        fileName: z.string().min(1, "Filename is required"),
    }))
})

export const AnnouncementIdPathSchema = z.object({
    id: objectIdSchema
})