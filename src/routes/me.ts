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
        currency: req.session.user.currency,
        experience: req.session.user.experience,
        level: req.session.user.level,
    });
});

meRouter.get('/platform', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const platform = await db.platform.findFirst({
        where: { ownerId: req.session.user.id },
    });
    console.log(platform);
    if (!platform) {
        return res.sendStatus(404);
    }
    return res.json({ platformId: platform.id });
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
