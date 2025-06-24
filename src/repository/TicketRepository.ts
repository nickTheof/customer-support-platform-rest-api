import {ITicketRepository} from "./ITicketRepository";
import {ITicketDocument} from "../core/interfaces/ticket.interfaces";
import {Ticket} from "../models/ticket.model";

export class TicketRepository implements ITicketRepository {
    async create(ticket: Partial<ITicketDocument>): Promise<ITicketDocument> {
        return (await Ticket.create(ticket));
    }

    async deleteById(id: string): Promise<ITicketDocument | null> {
        return (await Ticket.findByIdAndDelete(id))
    }

    async getAll(): Promise<ITicketDocument[]> {
        return (await Ticket.find())
    }

    async getById(id: string): Promise<ITicketDocument[] | null> {
        return (await Ticket.findById(id));
    }

    async updateById(id: string, ticket: Partial<ITicketDocument>): Promise<ITicketDocument | null> {
        return (await Ticket.findByIdAndUpdate(id, {
            $set: ticket
        }))
    }

}