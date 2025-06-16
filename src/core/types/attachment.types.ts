import {SaveAttachmentSchema} from "../../schemas/attachment.schemas";
import {z} from "zod/v4";

export type SaveAttachmentDTO = z.infer<typeof SaveAttachmentSchema>;