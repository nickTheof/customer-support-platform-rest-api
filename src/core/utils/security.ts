import env_config from "../env_config";
import bcrypt from "bcrypt";
import * as crypto from "node:crypto";

const hashPassword = async(password: string) => {
    const salt = await bcrypt.genSalt(env_config.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
}

const comparePassword = (plainPassword: string, storedPassword: string) => {
    return bcrypt.compare(plainPassword, storedPassword);
}

const generateVerificationToken = () => {
    const verificationToken = crypto.randomBytes(64).toString("hex");
    return crypto.createHash("sha256").update(verificationToken).digest("hex");
}

const generateResetPasswordToken = () => {
    const resetToken = crypto.randomBytes(64).toString("hex");
    return crypto.createHash("sha256").update(resetToken).digest("hex");
}

const generateEnableUserToken = () => {
    const enableUserToken = crypto.randomBytes(64).toString("hex");
    return crypto.createHash("sha256").update(enableUserToken).digest("hex");
}

export {
    hashPassword,
    comparePassword,
    generateVerificationToken,
    generateResetPasswordToken,
    generateEnableUserToken,
}