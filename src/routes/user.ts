import express from 'express';
import { db } from '../db';

const userRouter = express.Router();

userRouter.post('/', async (req, res) => {
    const { displayName, email, password } = req.body;

    const result = await db.user.create({
        data: {
            displayName: displayName,
            email: email,
            password: password,
        },
    });

    res.json({ id: result.id });
});

export { userRouter };
