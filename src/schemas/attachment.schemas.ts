import {z} from "zod/v4";

export const SaveAttachmentSchema = z.object({
    fileName: z.string().min(1),
    savedName: z.string().min(1),
    filePath: z.string().min(1),
    contentType: z.string().min(1),
    fileExtension: z.enum(["pdf", "zip"])
})