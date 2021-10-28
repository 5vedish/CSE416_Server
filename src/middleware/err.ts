import { NextFunction, Request, Response } from 'express';

export const errHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    console.error(err);

    return res.sendStatus(500);
};
