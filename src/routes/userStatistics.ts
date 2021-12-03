import { prisma } from '@prisma/client';
import express from 'express';
import { db } from '../db';

const userStatsRouter = express.Router();

userStatsRouter.get('/', async (req, res) => {
    if (!req.session) {
        return res.status(401);
    }

    const { userId } = req.body;
    const numericId = parseInt(userId);

    const aggregations = await db.quizAttempt.aggregate({
        _avg: {
            questionsCorrect: true,
        },
        where: {
            userId: numericId,
        },
    });

    console.log(aggregations._avg);

    return res.status(200);
});

export { userStatsRouter };
