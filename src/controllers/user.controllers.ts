import catchAsync from "../core/utils/catchAsync";
import {Request, Response, NextFunction} from "express";
import {UserService} from "../services/UserService";
import {sendPaginatedResponse, sendResponse} from "../core/utils/sendResponses";
import {
    BaseUserReadOnlyDTOWithVerification, FilterPaginationUsersDTO, UpdateUserRoleDTO,
    UserInsertDTO,
    UserReadOnlyDTO, UserUpdateDTO,
} from "../core/types/zod-model.types";
import emailServices from "../services/email.services";
import env_config from "../core/env_config";
import {SMTPError} from "nodemailer/lib/smtp-connection";
import {AppServerException} from "../core/exceptions/app.exceptions";
import {RoleRepository} from "../repository/RoleRepository";
import {UserRepository} from "../repository/UserRepository";

const roleRepository = new RoleRepository();
const userRepository = new UserRepository(roleRepository);
const userServices = new UserService(userRepository, roleRepository);
/**
 * Retrieves all users.
 * @route GET /api/v1/users
 * @returns {UserReadOnlyDTO[]} 200 - Array of users
 */
const getAllUsers = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
    const users: UserReadOnlyDTO[] = await userServices.getAll();
    sendResponse<UserReadOnlyDTO>(users, 200, res);
})


/**
 * Controller for retrieving users with dynamic filtering and pagination.
 * Expects validated filters in res.locals.validatedBody.
 * Calls the user service, and sends a paginated response including total count.
 * Handles any errors through catchAsync middleware.
 *
 * @route POST /api/v1/users/filter
 * @param {Request} _req - Express request object (not used, relies on validated body).
 * @param {Response} res - Express response object for sending data.
 * @param {NextFunction} _next - Express next middleware (handled by catchAsync).
 * @returns {void}
 */
const getFilteredPaginatedUsers = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
    const filters: FilterPaginationUsersDTO = res.locals.validatedBody;
    const {totalCount, data} = await userServices.getAllFilteredPaginated(filters);
    sendPaginatedResponse<UserReadOnlyDTO>(data, totalCount, filters.page + 1, filters.pageSize, 200, res);
})

/**
 * Registers a new user with a custom role and sends a verification email.
 * Rolls back if the email service fails.
 * @route POST /api/v1/users
 * @param {UserInsertDTO} req.body - User DTO to insert
 * @returns {BaseUserReadOnlyDTOWithVerification} 201 - Created user with verification data
 * @throws {AppServerException} If verification email fails
 */
const createUser = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const data: UserInsertDTO = req.body;
    const savedUser: BaseUserReadOnlyDTOWithVerification = await userServices.createUser(data);
    try {
        await emailServices.sendVerificationEmail(savedUser.email, `${env_config.FRONTEND_VERIFICATION_URL}token=${savedUser.verificationToken}`)
    } catch (err: any) {
        // Rollback - delete user - Registration failed
        await userServices.deleteUserById(savedUser._id);
        const smtpError: SMTPError = err;
        const smtpResponse = smtpError.response || "Unknown SMTP error";
        throw new AppServerException("EmailServiceException", smtpResponse);
    }
    sendResponse<BaseUserReadOnlyDTOWithVerification>(savedUser, 201, res)
})


/**
 * Retrieves a user by id.
 * @route GET /api/v1/users/:id
 * @param {string} req.params.id - User ID
 * @returns {UserReadOnlyDTO} 200 - The requested user
 * @throws {AppObjectNotFoundException} If user is not found
 */
const getUserById =  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId: string = req.params.id;
    const user: UserReadOnlyDTO = await userServices.getById(userId);
    sendResponse<UserReadOnlyDTO>(user, 200, res);
})

/**
 * Fully updates a user by id.
 * @route PUT /api/v1/users/:id
 * @param {string} req.params.id - User ID
 * @param {UserUpdateDTO} req.body - User update data
 * @returns {UserReadOnlyDTO} 200 - Updated user
 * @throws {AppObjectNotFoundException} If user is not found
 */
const updateUserById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId: string = req.params.id;
    const data: UserUpdateDTO = req.body;
    const updatedUser: UserReadOnlyDTO = await userServices.updateUserById(userId, data);
    sendResponse<UserReadOnlyDTO>(updatedUser, 200, res);
})

/**
 * Partially updates a user by id.
 * @route PATCH /api/v1/users/:id
 * @param {string} req.params.id - User ID
 * @param {UserUpdateDTO} req.body - User patch data (partial)
 * @returns {UserReadOnlyDTO} 200 - Updated user
 * @throws {AppObjectNotFoundException} If user is not found
 */
const partialUpdateUserById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId: string = req.params.id;
    const data: UserUpdateDTO = req.body;
    const updatedUser: UserReadOnlyDTO = await userServices.partialUpdateUserById(userId, data);
    sendResponse<UserReadOnlyDTO>(updatedUser, 200, res);
})


/**
 * Updates a user's role by id.
 * @route PUT /api/v1/users/:id/change-role
 * @param {string} req.params.id - User ID
 * @param {UpdateUserRoleDTO} req.body - Role update data
 * @returns {UserReadOnlyDTO} 200 - Updated user
 * @throws {AppObjectNotFoundException} If user or role is not found
 */
const updateUserRole = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId: string = req.params.id;
    const dto: UpdateUserRoleDTO = req.body;
    const updatedUser: UserReadOnlyDTO = await userServices.updateUserRole(userId, dto);
    sendResponse<UserReadOnlyDTO>(updatedUser, 200, res);
})


/**
 * Deletes a user by id.
 * @route DELETE /api/v1/users/:id
 * @param {string} req.params.id - User ID
 * @returns {void} 204 - No Content
 * @throws {AppObjectNotFoundException} If user is not found
 */
const deleteUserById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId: string = req.params.id;
    await userServices.deleteUserById(userId);
    sendResponse(null, 204, res);
})

export default {
    getAllUsers,
    getFilteredPaginatedUsers,
    createUser,
    updateUserById,
    partialUpdateUserById,
    updateUserRole,
    deleteUserById,
    getUserById,
}