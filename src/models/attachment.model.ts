import {IAttachmentDocument} from "../core/interfaces/attachment.interfaces";
import {Schema, model} from "mongoose";
import {ATTACHMENT_MODEL_NAME} from "../core/interfaces/role.interfaces";

const AttachmentSchema = new Schema<IAttachmentDocument>({
    fileName: {type: String, required: true},
    savedName: {type: String, required: true, unique: true},
    filePath: {type: String, required: true},
    contentType: {type: String, required: true},
    fileExtension: {type: String, required: true},
}, {timestamps: true, versionKey: false});

export const Attachment = model<IAttachmentDocument>(ATTACHMENT_MODEL_NAME, AttachmentSchema);