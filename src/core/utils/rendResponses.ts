import { Response } from 'express';

export const sendResponse = <T>(
    data: T | T[] | null,
    statusCode: number,
    res: Response
) => {
    if (statusCode === 204) {
        // 204 No Content must not have a response body
        return res.status(204).send();
    }

    return res.status(statusCode).send({
        status: true,
        data,
    });
};