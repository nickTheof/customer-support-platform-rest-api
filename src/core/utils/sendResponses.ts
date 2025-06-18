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


export const sendPaginatedResponse = <T>(
    data: T[],
    totalItems: number,
    currentPage: number,
    pageSize: number,
    statusCode: number,
    res: Response
) => {
    return res.status(statusCode).send({
        status: true,
        data,
        totalItems,
        currentPage,
        pageSize,
        totalPages: Math.ceil(totalItems / pageSize),
        numberOfElements: data.length
    });
};