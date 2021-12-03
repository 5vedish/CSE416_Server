import { prisma } from '@prisma/client';
import express from 'express';
import { db } from '../db';

const userStatsRouter = express.Router();

userStatsRouter.get('/', async (req, res) => {
    if (!req.session) {
        return res.status(401);
    }

    const { user } = req.session;

    const attempt_aggregations = await db.quizAttempt.aggregate({
        _avg: {
            questionsCorrect: true,
        },
        where: {
            userId: user.id,
        },
    });

    const lifetimeQuizzes = await db.user.findFirst({
        where: {
            id: user.id,
        },
        include: {
            _count: {
                select: { quizAttempts: true },
            },
        },
    });

    const diff = await db.quizAttempt.groupBy({
        by: ['difficulty'],
        _count: true,
    });

    let diffs = { e: 0, m: 0, h: 0 };

    diff.map((difficulty) => {
        switch (difficulty.difficulty) {
            case 'HARD':
                diffs['h'] = difficulty._count;
                break;
            case 'MEDIUM':
                diffs['m'] = difficulty._count;
                break;
            case 'EASY':
                diffs['e'] = difficulty._count;
                break;
        }
    });

    console.log(diffs);

    if (lifetimeQuizzes) console.log(lifetimeQuizzes._count);

    res.json({
        averageScore: attempt_aggregations._avg ?? 0,
        lifetimeQuizzes: lifetimeQuizzes?._count,
        diffs: diffs,
    });
});

export { userStatsRouter };
