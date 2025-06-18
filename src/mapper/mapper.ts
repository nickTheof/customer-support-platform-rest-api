import {IUserDocument, Profile} from "../core/interfaces/user.interfaces";
import {
    BaseUserReadOnlyDTO,
    BaseUserReadOnlyDTOWithRole,
    BaseUserReadOnlyDTOWithVerification, UserReadOnlyDTO
} from "../core/types/zod-model.types";
import {IRoleDocument} from "../core/interfaces/role.interfaces";

const mapRoleToReadOnlyDTO = (role: IRoleDocument) => {
    return {
        name: role.name,
        authorities: role.authorities,
    }
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

export default {
    mapUserToBaseUserDTO,
    mapRoleToReadOnlyDTO,
    mapUserToBaseUserDTOWithVerificationCredentials,
    mapUserToBaseUserDTOWithRole,
    mapUserToReadOnlyDTO
}