export interface EmailTemplates {
    verification: string;
    passwordReset: string;
    accountUnlock: string;
}

export interface IEmailService {
    sendVerificationEmail(to: string, verificationUrl: string): Promise<void>;
    sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
    sendUnlockAccountEmail(to: string, unlockUrl: string): Promise<void>;
}