import { model, Schema } from "mongoose";
import { IAnnouncementDocument } from "../core/interfaces/announcement.interfaces";
import {ANNOUNCEMENT_MODEL_NAME, ATTACHMENT_MODEL_NAME, USER_MODEL_NAME} from "../core/interfaces/role.interfaces";

const AnnouncementSchema = new Schema<IAnnouncementDocument>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        attachments: { type: [Schema.Types.ObjectId], ref: ATTACHMENT_MODEL_NAME, default: [] },
        authorId: { type: Schema.Types.ObjectId, ref: USER_MODEL_NAME, required: true },
        viewerStatus: { type: [Schema.Types.ObjectId], ref: USER_MODEL_NAME, default: [] },
    },
    { timestamps: true, versionKey: false}
);

export const Announcement = model<IAnnouncementDocument>(ANNOUNCEMENT_MODEL_NAME, AnnouncementSchema);
