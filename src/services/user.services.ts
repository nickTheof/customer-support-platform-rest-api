import {User} from "../models/user.model";
import {
    AppObjectNotFoundException,
} from "../core/exceptions/app.exceptions";


const getByEmail = async (email: string) => {
    const doc = await User.findOne({email: email});
    if (!doc) {
        throw new AppObjectNotFoundException("User", `User with email ${email} not found`);
    }
    return doc;
}

const getByVat = async (vat: string) => {
    const doc = await User.findOne({vat: vat});
    if (!doc) {
        throw new AppObjectNotFoundException("User", `User with vat ${vat} not found`);
    }
    return doc;
}

const isValidEmail = async (email: string) => {
    const results = await User.findOne({email: email}).countDocuments();
    return results === 0;
}

const isValidVat = async (vat: string) => {
    const results = await User.findOne({vat: vat}).countDocuments();
    return results === 0;
}

const deleteUserById = async (id: string) => {
    const doc = await User.findOne({_id: id});
    if (!doc) {
        throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
    }
    await User.deleteOne({_id: id});
}

const deleteUserByEmail = async (email: string) => {
    const doc = await User.findOne({email: email});
    if (!doc) {
        throw new AppObjectNotFoundException("User", `User with email ${email} not found`);
    }
    await User.deleteOne({email: email});
}

export default {
    isValidEmail,
    isValidVat,
    getByEmail,
    getByVat,
    deleteUserById,
    deleteUserByEmail,
}