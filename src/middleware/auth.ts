import { differenceInDays } from 'date-fns';
import { NextFunction, Request, Response } from 'express';
import { db } from '../db';
import { verifySession } from '../utils/auth';

export const authHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (!req.cookies.sessionId) {
        return next();
    }

    const session = await db.session.findUnique({
        where: { id: req.cookies.sessionId },
        include: {
            user: true,
        },
    });

    if (!session) {
        return res.sendStatus(401);
    }

    if (!verifySession(session.createdAt)) {
        await db.session.delete({ where: { id: session.id } });

        return res.sendStatus(410);
    }

    req.session = session;

    return next();
};
