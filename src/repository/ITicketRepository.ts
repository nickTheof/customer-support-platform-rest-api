import {ITicketDocument} from "../core/interfaces/ticket.interfaces";

export interface ITicketRepository {
    getAll(): Promise<ITicketDocument[]>
    getById(id: string): Promise<ITicketDocument[] | null>
    create(ticket: Partial<ITicketDocument>): Promise<ITicketDocument>
    updateById(id: string, ticket: Partial<ITicketDocument>): Promise<ITicketDocument | null>
    deleteById(id: string): Promise<ITicketDocument | null>
}