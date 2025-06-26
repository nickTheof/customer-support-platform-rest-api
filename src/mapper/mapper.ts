import {IUserDocument, Profile} from "../core/interfaces/user.interfaces";
import {
    AnnouncementReadOnlyDTO,
    BaseUserReadOnlyDTO,
    BaseUserReadOnlyDTOWithRole,
    BaseUserReadOnlyDTOWithVerification,
    RoleReadOnlyDTO,
    RoleReadOnlyWithIdDTO,
    RoleUpdateDTO,
    UserPatchDTO,
    UserReadOnlyDTO,
    UserUpdateDTO
} from "../core/types/zod-model.types";
import {AuthorityAction, IRoleDocument, ResourceAction} from "../core/interfaces/role.interfaces";
import {IAnnouncementDocument} from "../core/interfaces/announcement.interfaces";

const mapRoleToReadOnlyDTO = (role: IRoleDocument): RoleReadOnlyDTO => {
    return {
        name: role.name,
        authorities: role.authorities,
    }
}

const mapRoleToReadOnlyDTOWithID = (role: IRoleDocument): RoleReadOnlyWithIdDTO => {
    return {
        id: role._id.toString(),
        name: role.name,
        authorities: role.authorities,
    }
}

const mapRoleDtoToDocument = (dto: RoleUpdateDTO): Partial<IRoleDocument> =>{
    return {
        name: dto.name,
        authorities: dto.authorities.map((auth) => ({
            resource: auth.resource as ResourceAction,
            actions: auth.actions as AuthorityAction[],
        })),
    };
}


const mapUserToBaseUserDTO = (user: IUserDocument): BaseUserReadOnlyDTO => {
    return {
        _id: user._id.toString(), email: user.email, enabled: user.enabled, verified: false
    }
}

const mapUserToBaseUserDTOWithRole = (user: IUserDocument): BaseUserReadOnlyDTOWithRole => {
    const userRole = user.role as IRoleDocument;
    const mappedRole = mapRoleToReadOnlyDTO(userRole);
    return {
        _id: user._id.toString(), email: user.email, enabled: user.enabled, role: mappedRole, verified: false
    }
}

const mapUserToBaseUserDTOWithVerificationCredentials = (user: IUserDocument): BaseUserReadOnlyDTOWithVerification => {
    return {
        _id: user._id.toString(), email: user.email, enabled: user.enabled, verified: false, verificationToken: user.verificationToken ?? "",
    }
}

const mapUserToReadOnlyDTO = (user: IUserDocument): UserReadOnlyDTO => {
    const userRole = user.role as IRoleDocument;
    const profile = user.profile as Profile;
    const mappedRole = mapRoleToReadOnlyDTO(userRole);
    return {
        _id: user._id.toString(),
        email: user.email,
        enabled: user.enabled,
        profile: profile,
        role: mappedRole,
        vat: user.vat,
        verified: user.verified
    }
}

const mapUserPatchDTOToDocument = (dto: UserPatchDTO): Partial<IUserDocument> => {
    const updateFields: Partial<IUserDocument> = {};
    if (dto.profile) updateFields["profile"] = dto.profile;
    if (typeof dto.enabled === "boolean") updateFields["enabled"] = dto.enabled;
    if (typeof dto.enabled === "boolean") updateFields["verified"] = dto.verified;
    return updateFields;
}

const mapUserUpdateDTOToDocument = (dto: UserUpdateDTO): Partial<IUserDocument> => {
    return {...dto};
}

const mapAnnouncementToReadOnly = (dto: IAnnouncementDocument): AnnouncementReadOnlyDTO => {
    return {
        attachments: dto.attachments?.map(att => att.toString()),
        author: {
            email: (dto.authorId as IUserDocument).email
        },
        description: dto.description,
        title: dto.title

    }
}

export default {
    mapRoleToReadOnlyDTOWithID,
    mapUserToBaseUserDTO,
    mapRoleToReadOnlyDTO,
    mapUserToBaseUserDTOWithVerificationCredentials,
    mapUserToBaseUserDTOWithRole,
    mapUserToReadOnlyDTO,
    mapRoleDtoToDocument,
    mapUserPatchDTOToDocument,
    mapUserUpdateDTOToDocument,
    mapAnnouncementToReadOnly,
}