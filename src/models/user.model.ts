import {model, Query, Schema} from "mongoose";
import {Address, IUserDocument, Phone, Profile} from "../core/interfaces/user.interfaces";
import {ANNOUNCEMENT_MODEL_NAME, ROLE_MODEL_NAME, TICKET_MODEL_NAME} from "../core/interfaces/role.interfaces";


export const PhoneSchema = new Schema<Phone>({
    type: {type: String, required: true},
    phone: {type: String, required: true},
}, {_id: false});

export const AddressSchema = new Schema<Address>({
    street: {type: String, required: true},
    number: {type: String, required: true},
    city: {type: String, required: true},
    zipCode: {type: String, required: true},
}, {_id: false});

export const ProfileSchema = new Schema<Profile>({
    firstname: {type: String},
    lastname: {type: String},
    avatar: {type: String},
    phones: {
        type: [PhoneSchema], default: []
    },
    address: AddressSchema
}, {_id: false});

export const UserSchema = new Schema<IUserDocument>({
    email: {type: String, required: true, unique: true},
    vat: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    enabled: {type: Boolean, required:true, default: false},
    verified: {type: Boolean, required:true,  default: false},
    loginConsecutiveFailures: {type: Number, required:true, default: 0},
    passwordChangedAt: {type: Date, required: true},
    passwordResetToken: {type: String},
    passwordResetTokenExpires: {type: Date},
    verificationToken: {type: String},
    verificationTokenExpires: {type: Date},
    enableUserToken: {type: String},
    enableUserTokenExpires: {type: Date},
    role: {type: Schema.Types.ObjectId, ref: ROLE_MODEL_NAME, required: true},
    profile: {type: ProfileSchema, default: null},
    tickets: {type: [Schema.Types.ObjectId], ref: TICKET_MODEL_NAME, default: []},
    announcements: {type: [Schema.Types.ObjectId], ref: ANNOUNCEMENT_MODEL_NAME, default: []},
    }, {
    timestamps: true,
    versionKey: false,
})

// Auto-populate role on all find queries
UserSchema.pre(/^find/, function(this: Query<any, IUserDocument>, next) {
    this.populate('role');
    next();
});

export const User = model<IUserDocument>("User", UserSchema);