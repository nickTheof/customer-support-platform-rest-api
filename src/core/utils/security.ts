import env_config from "../env_config";
import bcrypt from "bcrypt";

const hashPassword = async(password: string) => {
    const salt = await bcrypt.genSalt(env_config.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
}

const comparePassword = (plainPassword: string, storedPassword: string) => {
    return bcrypt.compare(plainPassword, storedPassword);
}

export {
    hashPassword,
    comparePassword,
}