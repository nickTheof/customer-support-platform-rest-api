import {Document, Types} from 'mongoose';
import {ITicketDocument} from "./ticket.interfaces";
import {IAnnouncementDocument} from "./announcement.interfaces";
import {IRoleDocument} from "./role.interfaces";

export interface Phone {
    type: string;
    phone: string;
}

export interface Address {
    street: string;
    number: string;
    city: string;
    zipCode: string;
}

export interface Profile {
    firstname?: string;
    lastname?: string;
    avatar?: string;
    phones?: Phone[];
    address?: Address;
}

export interface IUserDocument extends Document {
    email: string;
    vat: string;
    password: string;
    enabled: boolean;
    verified: boolean;
    loginConsecutiveFailures: number;
    passwordChangedAt: Date;
    passwordResetToken?: string;
    passwordResetTokenExpires?: Date;
    role: Types.ObjectId | IRoleDocument;
    createdAt: Date;
    updatedAt: Date;
    profile?: Profile;
    tickets?: Types.ObjectId[] | ITicketDocument[];
    announcements?: Types.ObjectId[] | IAnnouncementDocument[];
}