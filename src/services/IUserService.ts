import {
    BaseUserReadOnlyDTOWithVerification,
    FilterPaginationUsersDTO, UpdateUserRoleDTO,
    UserInsertDTO, UserPatchDTO,
    UserReadOnlyDTO, UserUpdateDTO
} from "../core/types/zod-model.types";


export interface IUserService {
    getAll(): Promise<UserReadOnlyDTO[]>;

    getAllFilteredPaginated(filters: FilterPaginationUsersDTO): Promise<{
        data: UserReadOnlyDTO[],
        totalCount: number
    }>;

    getById(id: string): Promise<UserReadOnlyDTO>;
    createUser(user: UserInsertDTO): Promise<BaseUserReadOnlyDTOWithVerification>;
    updateUserById(id: string, dto: UserUpdateDTO): Promise<UserReadOnlyDTO>;
    partialUpdateUserById(id: string, dto: UserPatchDTO): Promise<UserReadOnlyDTO>;
    updateUserRole(id: string, dto: UpdateUserRoleDTO): Promise<UserReadOnlyDTO>;
    deleteUserById(id: string): Promise<void>;
    deleteUserByEmail(email: string): Promise<void>;
}
