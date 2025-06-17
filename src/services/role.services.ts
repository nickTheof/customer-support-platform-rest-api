import {Role} from "../models/role.model";
import {AppObjectNotFoundException} from "../core/exceptions/app.exceptions";


const getByRoleName = async(roleName: string) => {
    const doc = await Role.findOne({name: roleName});
    if (!doc) {
        throw new AppObjectNotFoundException("Role", `Role with name ${roleName} not found`);
    }
    return doc;
}

export default {
    getByRoleName,
}