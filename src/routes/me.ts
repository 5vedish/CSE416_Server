import express from 'express';
import { db } from '../db';

import { hashPassword } from '../utils/auth';

const meRouter = express.Router();

meRouter.get('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    return res.status(200).json({
        displayName: req.session.user.displayName,
        email: req.session.user.email,
    });
});

meRouter.delete('/sessions', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    await db.session.delete({ where: { id: req.session.id } });
    res.clearCookie('sessionId');
    return res.sendStatus(200);
});

meRouter.patch('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { displayName, email, password } = req.body;

    if (password) {
        await db.user.update({
            where: { id: req.session.user.id },
            data: {
                password: await hashPassword(password),
            },
        });
    } else {
        await db.user.update({
            where: { id: req.session.user.id },
            data: {
                displayName,
                email,
            },
        });
    }

    return res.sendStatus(200);
});

export { meRouter };