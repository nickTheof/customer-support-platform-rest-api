import {Request, Response} from "express";
const healthCheck = (_req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
    })
}

export default {
    healthCheck,
}