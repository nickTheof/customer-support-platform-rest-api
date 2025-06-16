import {z} from "zod/v4";
import {Types} from "mongoose";

// Reusable ObjectId validator
export const objectIdSchema = z.string().refine(
    (val) => Types.ObjectId.isValid(val),
    { message: "Invalid ObjectId" }
);

export const PhoneInsertDTOSchema = z.object({
    type: z.string().min(1, "Phone type is required"),
    phone: z.string().min(10, "Phone number must have at least 10 numbers"),
})

export const AddressInsertDTOSchema = z.object({
    street: z.string().min(1, "Street is required"),
    number: z.string().min(1, "Street number is required"),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(1, "Zip Code is required"),
})

export const ProfileInsertDTOSchema = z.object({
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    avatar: z.string().optional(),
    phones: z.array(PhoneInsertDTOSchema).optional(),
    address: AddressInsertDTOSchema.optional(),
})

/**
 * userRegisterDTO will be used in the public route for register users with restricted authorities for CLIENT users
 */
export const UserRegisterDTOSchema = z.object({
    email: z.email("Email must be a valid email address"),
    vat: z.string().regex(/^\d{10,}$/, "Vat must be at least 10 digits long"),
    password: z.string().min(8).refine((val) => /[a-z]/.test(val), {
        message: 'Password must contain lowercase',
    }).refine((val) => /[A-Z]/.test(val), {
        message: 'Password must contain uppercase',
    }).refine((val) => /\d/.test(val), {
        message: 'Password must contain number',
    }).refine((val) => /[!@#$%^&*]/.test(val), {
        message: 'Password must contain special character',
    }),
    profile: ProfileInsertDTOSchema.optional(),
})

/**
 * userInsertDTO will be used by ADMIN users for creating users with custom roles and extended authorities
 */
export const UserInsertDTOSchema = UserRegisterDTOSchema.extend({
    role: objectIdSchema
})