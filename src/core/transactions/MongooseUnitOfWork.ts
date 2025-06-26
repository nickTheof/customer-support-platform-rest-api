import { ClientSession, startSession } from "mongoose";
import { IUnitOfWork } from "./IUnitOfWork";
import {AppServerException} from "../exceptions/app.exceptions";

export class MongooseUnitOfWork implements IUnitOfWork {
    private session: ClientSession | null = null;

    async start(): Promise<void> {
        this.session = await startSession();
        this.session.startTransaction();
    }

    async commit(): Promise<void> {
        if (!this.session) throw new AppServerException("DBSessionError", "Failed to get session");
        await this.session.commitTransaction();
        await this.session.endSession();
    }

    async rollback(): Promise<void> {
        if (!this.session) throw new AppServerException("DBSessionError", "Failed to get session");
        await this.session.abortTransaction();
        await this.session.endSession();
    }

    getSession(): ClientSession {
        if (!this.session) throw new AppServerException("DBSessionError", "Failed to get session");
        return this.session;
    }
}