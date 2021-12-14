import { prisma } from '@prisma/client';
import express from 'express';
import { db } from '../db';
import differenceInSeconds from 'date-fns/differenceInSeconds';

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
        select: {
            _count: {
                select: { quizAttempts: true },
            },
        },
    });

    const diff = await db.quizAttempt.groupBy({
        where: { userId: user.id },
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

    const quizTimes = await db.quizAttempt.findMany({
        where: { userId: user.id },
        select: {
            startTime: true,
            endTime: true,
        },
    });

    let totalTimeSpent = 0;
    quizTimes.map((times) => {
        totalTimeSpent += differenceInSeconds(times.endTime, times.startTime);
    });

    res.json({
        averageScore: attempt_aggregations._avg ?? 0,
        lifetimeQuizzes: lifetimeQuizzes?._count ?? 0,
        diffs: diffs,
        timeData: {
            totalTimeSpent: totalTimeSpent,
            averageTimeSpent: lifetimeQuizzes?._count
                ? totalTimeSpent / lifetimeQuizzes._count.quizAttempts
                : 0,
        },
    });
});

export { userStatsRouter };
