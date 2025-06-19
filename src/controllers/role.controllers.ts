import {Request, Response, NextFunction} from "express";
import catchAsync from "../core/utils/catchAsync";
import {RoleInsertDTO, RolePatchDTO, RoleReadOnlyWithIdDTO, RoleUpdateDTO} from "../core/types/zod-model.types";
import roleServices from "../services/role.services";
import {sendResponse} from "../core/utils/sendResponses";

/**
 * Controller to get all roles.
 * Responds with an array of roles.
 *
 * @route GET /roles
 * @access Protected (requires authority)
 */
const getAllRoles = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
    const roles: RoleReadOnlyWithIdDTO[] = await roleServices.getAll();
    sendResponse<RoleReadOnlyWithIdDTO>(roles, 200, res)
})

/**
 * Controller to get a role by its ID.
 *
 * @route GET /roles/:id
 * @param req.params.id - Role ID
 * @access Protected (requires authority)
 */
const getRoleById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const roleId = req.params.id;
    const role: RoleReadOnlyWithIdDTO = await roleServices.getById(roleId);
    sendResponse<RoleReadOnlyWithIdDTO>(role, 200, res)
})

/**
 * Controller to create a new role.
 *
 * @route POST /roles
 * @param req.body - RoleInsertDTO
 * @access Protected (requires authority)
 */
const createRole = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const dto = req.body as RoleInsertDTO;
    const createdRole: RoleReadOnlyWithIdDTO = await roleServices.create(dto);
    sendResponse<RoleReadOnlyWithIdDTO>(createdRole, 201, res)
})

/**
 * Controller to fully update an existing role by ID.
 *
 * @route PUT /roles/:id
 * @param req.params.id - Role ID
 * @param req.body - RoleUpdateDTO
 * @access Protected (requires authority)
 */
const updateRoleById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const roleId = req.params.id;
    const dto = req.body as RoleUpdateDTO;
    const updatedRole: RoleReadOnlyWithIdDTO = await roleServices.updateById(roleId, dto);
    sendResponse<RoleReadOnlyWithIdDTO>(updatedRole, 200, res)
})

/**
 * Controller to partially update an existing role by ID (PATCH semantics).
 *
 * @route PATCH /roles/:id
 * @param req.params.id - Role ID
 * @param req.body - RolePatchDTO
 * @access Protected (requires authority)
 */
const partialUpdateRoleById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const roleId = req.params.id;
    const dto = req.body as RolePatchDTO;
    const updatedRole: RoleReadOnlyWithIdDTO = await roleServices.partialUpdateById(roleId, dto);
    sendResponse<RoleReadOnlyWithIdDTO>(updatedRole, 200, res)
})


/**
 * Controller to delete a role by its ID.
 *
 * @route DELETE /roles/:id
 * @param req.params.id - Role ID
 * @access Protected (requires authority)
 */
const deleteRoleById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const roleId = req.params.id;
    await roleServices.deleteById(roleId);
    sendResponse(null, 204, res)
})

export default {
    getAllRoles,
    getRoleById,
    createRole,
    updateRoleById,
    partialUpdateRoleById,
    deleteRoleById,
}