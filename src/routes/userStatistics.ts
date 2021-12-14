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

    // query attempts

    const attempts = await db.quizAttempt.findMany({
        where: { userId: user.id },
    });

    // split attempts by difficulty

    const easyQuizzes = attempts.filter(
        (attempt) => attempt.difficulty === 'EASY',
    );
    const medQuizzes = attempts.filter(
        (attempt) => attempt.difficulty === 'MEDIUM',
    );
    const hardQuizzes = attempts.filter(
        (attempt) => attempt.difficulty === 'HARD',
    );

    console.log(easyQuizzes);

    // total quiz count

    const lifetimeQuizzes = attempts.length;

    // quiz count by difficulty

    const easyCount = easyQuizzes.length;
    const medCount = medQuizzes.length;
    const hardCount = hardQuizzes.length;

    // total questions answered

    const lifetimeQuestionsQuery = await db.quizAttempt.aggregate({
        where: { userId: user.id },
        _sum: {
            totalQuestions: true,
        },
    });

    const lifetimeQuestions = lifetimeQuestionsQuery._sum.totalQuestions;

    // questions answered by difficulty

    const easyQuestionsQuery = await db.quizAttempt.aggregate({
        where: {
            userId: user.id,
            difficulty: 'EASY',
        },
        _sum: {
            totalQuestions: true,
        },
    });

    const easyQuestions = easyQuestionsQuery._sum.totalQuestions;

    const medQuestionsQuery = await db.quizAttempt.aggregate({
        where: {
            userId: user.id,
            difficulty: 'MEDIUM',
        },
        _sum: {
            totalQuestions: true,
        },
    });

    const medQuestions = medQuestionsQuery._sum.totalQuestions;

    const hardQuestionsQuery = await db.quizAttempt.aggregate({
        where: {
            userId: user.id,
            difficulty: 'HARD',
        },
        _sum: {
            totalQuestions: true,
        },
    });

    const hardQuestions = hardQuestionsQuery._sum.totalQuestions;

    // total questions correct

    const lifetimeCorrectQuery = await db.quizAttempt.aggregate({
        where: { userId: user.id },
        _sum: {
            questionsCorrect: true,
        },
    });

    const lifetimeCorrect = lifetimeCorrectQuery._sum.questionsCorrect;

    // correct by difficulty

    const easyCorrectQuery = await db.quizAttempt.aggregate({
        where: {
            userId: user.id,
            difficulty: 'EASY',
        },
        _sum: {
            questionsCorrect: true,
        },
    });

    const easyCorrect = easyCorrectQuery._sum.questionsCorrect;

    const medCorrectQuery = await db.quizAttempt.aggregate({
        where: {
            userId: user.id,
            difficulty: 'MEDIUM',
        },
        _sum: {
            questionsCorrect: true,
        },
    });

    const medCorrect = medCorrectQuery._sum.questionsCorrect;

    const hardCorrectQuery = await db.quizAttempt.aggregate({
        where: {
            userId: user.id,
            difficulty: 'HARD',
        },
        _sum: {
            questionsCorrect: true,
        },
    });

    const hardCorrect = hardCorrectQuery._sum.questionsCorrect;

    // average score can be computed from previous statistics

    // const lifetimeAverage =
    //     lifetimeCorrect && lifetimeQuestions
    //         ? (lifetimeCorrect / lifetimeQuestions) * 500
    //         : 0;

    // const easyAverage =
    //     easyCorrect && easyQuestions ? (easyCorrect / easyQuestions) * 500 : 0;

    // const medAverage =
    //     medCorrect && medQuestions ? (medCorrect / medQuestions) * 500 : 0;

    // const hardAverage =
    //     hardCorrect && hardQuestions ? (hardCorrect / hardQuestions) * 500 : 0;

    // total time

    let lifetimeTime = 0;
    attempts.map((attempt) => {
        lifetimeTime += differenceInSeconds(attempt.endTime, attempt.startTime);
    });

    let easyTime = 0;
    easyQuizzes.map((attempt) => {
        easyTime += differenceInSeconds(attempt.endTime, attempt.startTime);
    });

    let medTime = 0;
    medQuizzes.map((attempt) => {
        medTime += differenceInSeconds(attempt.endTime, attempt.startTime);
    });

    let hardTime = 0;
    hardQuizzes.map((attempt) => {
        hardTime += differenceInSeconds(attempt.endTime, attempt.startTime);
    });

    // average time can be calculated from previous stats

    res.json({
        lifetime: [
            lifetimeQuizzes,
            lifetimeQuestions,
            lifetimeCorrect,
            lifetimeTime,
        ],
        easy: [easyCount, easyQuestions, easyCorrect, easyTime],
        med: [medCount, medQuestions, medCorrect, medTime],
        hard: [hardCount, hardQuestions, hardCorrect, hardTime],
    });
});

export { userStatsRouter };
