import {Request, Response} from "express";
import catchAsync from "../core/utils/catchAsync";
import {
    RoleInsertDTO,
    RolePatchDTO,
    RoleReadOnlyWithIdDTO,
    RoleUpdateDTO
} from "../core/types/zod-model.types";
import {sendResponse} from "../core/utils/sendResponses";
import {IRoleService} from "../services/IRoleService";


export class RoleController {
    constructor(private roleService: IRoleService) {
    }

    getAllRoles = catchAsync(async (_req: Request, res: Response) => {
        const roles: RoleReadOnlyWithIdDTO[] = await this.roleService.getAll();
        sendResponse<RoleReadOnlyWithIdDTO>(roles, 200, res);
    });

    getRoleById = catchAsync(async (req: Request, res: Response) => {
        const role: RoleReadOnlyWithIdDTO = await this.roleService.getById(req.params.id);
        sendResponse<RoleReadOnlyWithIdDTO>(role, 200, res);
    });

    createRole = catchAsync(async (req: Request, res: Response) => {
        const createdRole: RoleReadOnlyWithIdDTO = await this.roleService.create(req.body as RoleInsertDTO);
        sendResponse<RoleReadOnlyWithIdDTO>(createdRole, 201, res);
    });

    updateRoleById = catchAsync(async (req: Request, res: Response) => {
        const updatedRole: RoleReadOnlyWithIdDTO = await this.roleService.updateById(
            req.params.id,
            req.body as RoleUpdateDTO
        );
        sendResponse<RoleReadOnlyWithIdDTO>(updatedRole, 200, res);
    });

    partialUpdateRoleById = catchAsync(async (req: Request, res: Response) => {
        const updatedRole: RoleReadOnlyWithIdDTO = await this.roleService.partialUpdateById(
            req.params.id,
            req.body as RolePatchDTO
        );
        sendResponse<RoleReadOnlyWithIdDTO>(updatedRole, 200, res);
    });

    deleteRoleById = catchAsync(async (req: Request, res: Response) => {
        await this.roleService.deleteById(req.params.id);
        sendResponse(null, 204, res);
    });
}