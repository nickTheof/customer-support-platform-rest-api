import {z} from "zod/v4";
import {Types} from "mongoose";
import {RoleReadOnlyDTOSchema} from "./role.schemas";

// Reusable ObjectId validator
export const objectIdSchema = z.string().refine(
    (val) => Types.ObjectId.isValid(val),
    { message: "Invalid ObjectId" }
);

// Reusable Password validator
export const passwordSchema = z.string().min(8).refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain lowercase',
}).refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain uppercase',
}).refine((val) => /\d/.test(val), {
    message: 'Password must contain number',
}).refine((val) => /[!@#$%^&*]/.test(val), {
    message: 'Password must contain special character',
});

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

export const ProfileReadOnlyDTOSchema = ProfileInsertDTOSchema.extend({})

/**
 * userRegisterDTO will be used in the public route for register users with restricted authorities for CLIENT users
 */
export const UserRegisterDTOSchema = z.object({
    email: z.email("Email must be a valid email address"),
    vat: z.string().regex(/^\d{9,}$/, "Vat must be at least 9 digits long"),
    password: passwordSchema,
    profile: ProfileInsertDTOSchema.optional(),
})

/**
 * userInsertDTO will be used by ADMIN users for creating users with custom roles and extended authorities
 */
export const UserInsertDTOSchema = UserRegisterDTOSchema.extend({
    role: z.string().nonempty()
})

export const PasswordRecoveryPathSchema = z.object({
    email: z.email("Email must be a valid email address").nonempty("Email is required"),
})

export const RequestUnlockPathSchema = PasswordRecoveryPathSchema.extend({})

export const UserLoginDTOSchema = PasswordRecoveryPathSchema.extend({
    password: passwordSchema
})

export const VerifyAccountDTOSchema = z.object({
    token: z.string().nonempty("Token is required"),
    email: z.email("Email is required").nonempty("Email is required"),
})

export const UnlockAccountDTOSchema = VerifyAccountDTOSchema.extend({});

export const ResetPasswordDTOSchema = VerifyAccountDTOSchema.extend({
    newPassword: passwordSchema
})

export const BaseUserReadOnlyDTOSchema = z.object({
    _id: z.string().nonempty(),
    email:z.string().nonempty(),
    enabled:z.boolean(),
    verified:z.boolean(),
})

export const BaseUserReadOnlyDTOSchemaWithRole = BaseUserReadOnlyDTOSchema.extend({
    role: RoleReadOnlyDTOSchema
})

export const UserReadOnlyDTOSchemaWithVerificationToken = BaseUserReadOnlyDTOSchema.extend({
    verificationToken: z.string().nonempty()
})

export const UserReadOnlyDTOSchema = BaseUserReadOnlyDTOSchemaWithRole.extend({
    vat: z.string().nonempty(),
    profile: ProfileReadOnlyDTOSchema
})

export const UserIdPathSchema = z.object({
    id: objectIdSchema
})

export const UserUpdateDTOSchema = z.object({
    profile: ProfileInsertDTOSchema.strict(),
    enabled:z.boolean(),
    verified:z.boolean(),
}).strict();

export const UserPatchDTOSchema = UserUpdateDTOSchema.partial().refine(
    data => Object.keys(data).length > 0,
    { message: "At least one field must be provided." }
);

export const UpdateUserRoleDTOSchema = z.object({
    role: z.string().nonempty(),
}).strict()

export const FilterPaginationUserSchema = z.object({
    page: z.number().min(0).optional().default(0),
    pageSize: z.number().min(1).optional().default(10),
    email: z.string().optional().default(""),
    vat: z.string().optional().default(""),
    enabled:z.boolean().optional().default(true),
    verified:z.boolean().optional().default(true),
    role: z.array(z.string()).optional().default([]),
})