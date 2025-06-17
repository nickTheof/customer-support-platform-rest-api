import {model, Schema} from "mongoose";
import {
    Authority,
    AUTHORITY_ACTIONS,
    IRoleDocument,
    RESOURCES,
    ROLE_MODEL_NAME
} from "../core/interfaces/role.interfaces";

export const AuthoritySchema = new Schema<Authority>({
    resource: {
        type: String,
        enum: RESOURCES,
        required: true,
    },
    actions: {
        type: [String],
        enum: AUTHORITY_ACTIONS,
        default: []
    },
}, {_id: false});

export const RoleSchema = new Schema<IRoleDocument>({
    name: {type: String, required: true, unique: true},
    authorities: {
        type: [AuthoritySchema],
        default: []
    },
}, {timestamps: true, versionKey: false});


export const Role = model<IRoleDocument>(ROLE_MODEL_NAME, RoleSchema);
