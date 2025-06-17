import {model, Schema} from "mongoose";
import {ITicketDocument, Comment, TICKET_STATUSES} from "../core/interfaces/ticket.interfaces";
import {ATTACHMENT_MODEL_NAME, TICKET_MODEL_NAME, USER_MODEL_NAME} from "../core/interfaces/role.interfaces";

const CommentSchema = new Schema<Comment>({
    text: {type: String, required: true},
    authorId: {type: Schema.Types.ObjectId, ref: USER_MODEL_NAME, required: true},
}, {
    _id: false,
    timestamps: true,
})

const TicketSchema = new Schema<ITicketDocument>({
    title: {type: String, required: true},
    description: {type: String, required: true},
    attachments: { type: [Schema.Types.ObjectId], ref: ATTACHMENT_MODEL_NAME, default: [] },
    comments: {
        type: [CommentSchema], default: []
    },
    status: {
        type: String,
        enum: TICKET_STATUSES,
        default: "OPEN",
    }
}, {
    timestamps: true,
    versionKey: false,
})


export const Ticket = model<ITicketDocument>(TICKET_MODEL_NAME, TicketSchema);