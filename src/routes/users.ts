import express from 'express';
import { db } from '../db';

import { hashPassword } from '../utils/auth';

const userRouter = express.Router();

userRouter.post('/', async (req, res) => {
    const { displayName, email, password } = req.body;

    await db.user.create({
        data: {
            displayName: displayName,
            email: email,
            password: await hashPassword(password),
        },
    });

    res.sendStatus(200);
});

export { userRouter };
