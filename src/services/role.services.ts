import {Role} from "../models/role.model";
import {AppObjectNotFoundException} from "../core/exceptions/app.exceptions";


const getByRoleName = async(roleName: string) => {
    const doc = await Role.findOne({name: roleName});
    if (!doc) {
        throw new AppObjectNotFoundException("Role", `Role with name ${roleName} not found`);
    }
    return doc;
}

const roleExists = async (roleName: string) => {
    const count = await Role.find({
        name: roleName
    }).countDocuments();
    return count > 0;
}

export default {
    getByRoleName,
    roleExists,
}