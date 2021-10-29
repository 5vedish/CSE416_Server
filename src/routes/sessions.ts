import express from 'express';
import { db } from '../db';
import {
    hashPassword,
    checkPassword,
    generateSessionExpiry,
} from '../utils/auth';
import { nanoid } from 'nanoid';

const sessionRouter = express.Router();

sessionRouter.post('/', async (req, res) => {
    const { email, password } = req.body;

    const user = await db.user.findFirst({
        where: { email },
    });

    if (!user) {
        return res.sendStatus(400);
    }

    if (!(await checkPassword(password, user.password))) {
        return res.sendStatus(400);
    }

    const sessionId = nanoid();

    const session = await db.session.create({
        data: {
            id: sessionId,
            userId: user.id,
        },
    });

    return res
        .cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'none',
            expires: generateSessionExpiry(session.createdAt),
            domain: '.qiz-client.herokuapp.com',
        })
        .json({
            displayName: user.displayName,
            email: user.email,
        });
});

export { sessionRouter };
