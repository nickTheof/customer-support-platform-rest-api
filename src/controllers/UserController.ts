import catchAsync from "../core/utils/catchAsync";
import {Request, Response, NextFunction} from "express";
import {sendPaginatedResponse, sendResponse} from "../core/utils/sendResponses";
import {
    BaseUserReadOnlyDTOWithVerification, FilterPaginationUsersDTO, UpdateUserRoleDTO,
    UserInsertDTO,
    UserReadOnlyDTO, UserUpdateDTO,
} from "../core/types/zod-model.types";
import env_config from "../core/env_config";
import {SMTPError} from "nodemailer/lib/smtp-connection";
import {AppServerException} from "../core/exceptions/app.exceptions";
import {IUserService} from "../services/IUserService";
import {IEmailService} from "../services/IEmailService";

/**
 * User Controller
 *
 * Handles all user-related operations including:
 * - CRUD operations
 * - Pagination and filtering
 * - Email verification
 * - Role management
 */
export class UserController {
    constructor(private userService: IUserService, private emailService: IEmailService) {}

    /**
     * Get all users
     */
    getAllUsers = catchAsync(async (_req: Request, res: Response) => {
        const users: UserReadOnlyDTO[] = await this.userService.getAll();
        sendResponse<UserReadOnlyDTO>(users, 200, res);
    })

    /**
     *  Get filtered and paginated users
     */
    getFilteredPaginatedUsers = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
        const filters: FilterPaginationUsersDTO = res.locals.validatedBody;
        const {totalCount, data} = await this.userService.getAllFilteredPaginated(filters);
        sendPaginatedResponse<UserReadOnlyDTO>(data, totalCount, filters.page + 1, filters.pageSize, 200, res);
    })

    /**
     * Create a new user by a user with authority CREATE in resource User
     */
    createUser = catchAsync(async (req: Request, res: Response) => {
        const data: UserInsertDTO = req.body;
        const savedUser: BaseUserReadOnlyDTOWithVerification = await this.userService.createUser(data);
        try {
            await this.emailService.sendVerificationEmail(savedUser.email, `${env_config.FRONTEND_VERIFICATION_URL}token=${savedUser.verificationToken}`)
        } catch (err: any) {
            // Rollback - delete user - Registration failed
            await this.userService.deleteUserById(savedUser._id);
            const smtpError: SMTPError = err;
            const smtpResponse = smtpError.response || "Unknown SMTP error";
            throw new AppServerException("EmailServiceException", smtpResponse);
        }
        sendResponse<BaseUserReadOnlyDTOWithVerification>(savedUser, 201, res)
    })

    /**
     * Get user by ID
     */
    getUserById =  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
        const userId: string = req.params.id;
        const user: UserReadOnlyDTO = await this.userService.getById(userId);
        sendResponse<UserReadOnlyDTO>(user, 200, res);
    })

    /**
     * Full update a User by ID
     */
    updateUserById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
        const userId: string = req.params.id;
        const data: UserUpdateDTO = req.body;
        const updatedUser: UserReadOnlyDTO = await this.userService.updateUserById(userId, data);
        sendResponse<UserReadOnlyDTO>(updatedUser, 200, res);
    })

    /**
     * Partial update a User by ID
     */
    partialUpdateUserById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
        const userId: string = req.params.id;
        const data: UserUpdateDTO = req.body;
        const updatedUser: UserReadOnlyDTO = await this.userService.partialUpdateUserById(userId, data);
        sendResponse<UserReadOnlyDTO>(updatedUser, 200, res);
    })

    /**
     * Update the role of a User
     */
    updateUserRole = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
        const userId: string = req.params.id;
        const dto: UpdateUserRoleDTO = req.body;
        const updatedUser: UserReadOnlyDTO = await this.userService.updateUserRole(userId, dto);
        sendResponse<UserReadOnlyDTO>(updatedUser, 200, res);
    })

    /**
     * Delete a User by ID
     */
    deleteUserById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
        const userId: string = req.params.id;
        await this.userService.deleteUserById(userId);
        sendResponse(null, 204, res);
    })
}
