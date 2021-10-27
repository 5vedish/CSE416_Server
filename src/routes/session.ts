import express from 'express';
import { db } from '../db';
import { hashPassword, checkPassword, generateSessionExpiry } from '../utils';
import { nanoid } from nanoid;

const sessionRouter = express.Router();

sessionRouter.post('/', async (req, res) => {
    const { email, password } = req.body;

    const user = await db.user.findFirst({
        where: { email },
    });

    if (!checkPassword(password, user.password)) {
        res.sendStatus.json(400);
    }

    const sessionId = nanoid();

    const session = await db.session.create({
        data: {
            id: sessionId,
            userId: user.id,
        },
    });

    res.cookie('sessionId', sessionId, {
        httpOnly,
        secure,
        sameSite,
        expires: generateSessionExpiry(session.createdAt),
    });
    res.sendStatus(200);
});
