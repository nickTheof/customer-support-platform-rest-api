import {ZodError} from 'zod/v4';

export class AppGenericException extends Error {
    private readonly code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        this.name = new.target.name; // Sets the name property of the error instance to the actual class name that was used with new
        Object.setPrototypeOf(this, new.target.prototype); // Ensure instanceof works
    }
    getCode(): string {
        return this.code;
    }
}

export class AppObjectNotFoundException extends AppGenericException {
    public static readonly DEFAULT_NAME = 'NotFound';
    constructor(code: string, message: string) {
        super(`${code}${AppObjectNotFoundException.DEFAULT_NAME}`, message);
    }
}

export class AppObjectAlreadyExistsException extends AppGenericException {
    public static readonly DEFAULT_NAME = 'AlreadyExists';
    constructor(code: string, message: string) {
        super(`${code}${AppObjectAlreadyExistsException.DEFAULT_NAME}`, message);
    }
}

export class AppNotAuthorizedException extends AppGenericException {
    public static readonly DEFAULT_NAME = 'NotAuthorized';
    constructor(code: string, message: string) {
        super(`${code}${AppNotAuthorizedException.DEFAULT_NAME}`, message);
    }
}

export class AppForbiddenException extends AppGenericException {
    public static readonly DEFAULT_NAME = 'Forbidden';
    constructor(code: string, message: string) {
        super(`${code}${AppForbiddenException.DEFAULT_NAME}`, message);
    }
}

export class AppInvalidArgumentException extends AppGenericException {
    public static readonly DEFAULT_NAME = 'InvalidArgument';
    constructor(code: string, message: string) {
        super(`${code}${AppInvalidArgumentException.DEFAULT_NAME}`, message);
    }
}

export class AppServerException extends AppGenericException {
    constructor(code: string, message: string) {
        super(code, message);
    }
}

export class AppValidationException extends Error {
    public readonly zodError: ZodError;
    public readonly code = "ValidationError";
    constructor(message: string, zodError: ZodError) {
        super(message + "ValidationException");
        this.name = new.target.name;
        this.zodError = zodError;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
