import { prisma } from '@prisma/client';
import express from 'express';
import { db } from '../db';

const userStatsRouter = express.Router();

userStatsRouter.get('/', async (req, res) => {
    if (!req.session) {
        return res.status(401);
    }

    const { user } = req.session;

    const aggregations = await db.quizAttempt.aggregate({
        _avg: {
            questionsCorrect: true,
        },
        where: {
            userId: user.id,
        },
    });

    res.json({
        averageScore: aggregations._avg ?? 0,
    });
});

export { userStatsRouter };
