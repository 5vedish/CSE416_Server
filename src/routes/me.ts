import express from 'express';
import { db } from '../db';
import { authHandler } from '../middleware/auth';

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
    return res.sendStatus(200);
});

export { meRouter };
