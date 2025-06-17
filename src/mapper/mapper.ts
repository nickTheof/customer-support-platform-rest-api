import {IUserDocument} from "../core/interfaces/user.interfaces";
import {
    BaseUserReadOnlyDTO,
    BaseUserReadOnlyDTOWithRole,
    BaseUserReadOnlyDTOWithVerification
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

export default {
    mapUserToBaseUserDTO,
    mapRoleToReadOnlyDTO,
    mapUserToBaseUserDTOWithVerificationCredentials,
    mapUserToBaseUserDTOWithRole
}