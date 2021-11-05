import express from 'express';
import { db } from '../db';

import { hashPassword } from '../utils/auth';

const userRouter = express.Router();

userRouter.post('/', async (req, res) => {
    const { displayName, email, password } = req.body;

    console.log(req.body);

    await db.user.create({
        data: {
            displayName: displayName,
            email: email,
            password: await hashPassword(password),
            currency: 0,
            level: 1,
            experience: 0,
        },
    });

    res.sendStatus(200);
});

userRouter.get('/', async (req, res) => {
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

export { userRouter };
