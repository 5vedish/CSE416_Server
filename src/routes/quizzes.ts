import express from 'express';
import { db } from '../db';

const quizzesRouter = express.Router();

quizzesRouter.post('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
});

platformsRouter.post('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const { title, rating } = req.body;
    const ratingValue = parseInt(rating);

    const result = await db.platform.create({
        data: {
            title: title,
            ownerId: user.id,
            rating: ratingValue,
        },
    });

    res.json({ id: result.id });
});

export { quizzesRouter };
