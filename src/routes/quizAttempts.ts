import express from 'express';
import { db } from '../db';

const quizAttemptsRouter = express.Router({ mergeParams: true });

quizAttemptsRouter.get('/', async (req, res) => {
    if (!req.session) {
        console.log('what');
        return res.sendStatus(401);
    }
    const { user } = req.session;

    const returnAttempt = await db.quizAttempt.findFirst({
        take: -1,
        where: { userId: user.id },
    });
    if (!returnAttempt) {
        return res.sendStatus(404);
    }
    return res.json({
        userId: user.id,
        startTime: returnAttempt.startTime,
        endTime: returnAttempt.endTime,
        questionsCompleted: returnAttempt.questionsCompleted,
        questionsCorrect: returnAttempt.questionsCorrect,
        totalQuestions: returnAttempt.totalQuestions,
        difficulty: returnAttempt.difficulty,
    });
});

quizAttemptsRouter.post('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const { user } = req.session;
    const params = req.params as { quizId: string };
    const quizId = parseInt(params.quizId);

    const quiz = await db.quiz.findFirst({
        where: { id: quizId },
        include: {
            platform: {
                select: {
                    ownerId: true,
                },
            },
            questions: true,
        },
    });
    if (!quiz) {
        return res.sendStatus(404);
    }
    const quizAttempt = await db.quizAttempt.create({
        data: {
            userId: user.id,
            totalQuestions: quiz.questions.length,
            difficulty: quiz.difficulty,
        },
    });
    return res.json({ attemptId: quizAttempt.id });
});

quizAttemptsRouter.patch('/:attemptId', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const { user } = req.session;
    const params = req.params as { attemptId: string; quizId: string };
    const quizId = parseInt(params.quizId);
    const attemptId = parseInt(params.attemptId);

    const {
        selectedChoices,
        endTime,
    }: { selectedChoices: number[]; endTime: string } = req.body;
    console.log(req.body);
    const quiz = await db.quiz.findFirst({
        where: { id: quizId },
        include: {
            platform: {
                select: {
                    ownerId: true,
                },
            },
            questions: {
                select: {
                    correctChoice: true,
                },
            },
        },
    });
    if (!quiz || quiz.platform.ownerId !== user.id) {
        return res.sendStatus(404);
    }
    console.log(req.body);

    const correctQuestionCount = selectedChoices.reduce((prev, curr, ind) => {
        if (curr === quiz.questions[ind].correctChoice) {
            return prev + 1;
        }
        return prev;
    }, 0);

    const completedQuestionCount = selectedChoices.reduce((prev, curr) => {
        if (curr !== -1) {
            return prev + 1;
        }
        return prev;
    }, 0);

    const updateAttempt = await db.quizAttempt.updateMany({
        where: {
            id: attemptId,
            userId: user.id,
        },
        data: {
            endTime: new Date(endTime),
            questionsCompleted: completedQuestionCount,
            questionsCorrect: correctQuestionCount,
        },
    });
    if (updateAttempt.count == 0) {
        return res.sendStatus(404);
    }
    const returnAttempt = await db.quizAttempt.findFirst({
        where: {
            id: attemptId,
        },
    });
    if (!returnAttempt) return res.sendStatus(404);
    console.log('BACKEND REWARDS USERID');
    console.log(user.id);
    return res.json({
        userId: user.id,
        startTime: returnAttempt.startTime,
        endTime: returnAttempt.endTime,
        questionsCompleted: returnAttempt.questionsCompleted,
        questionsCorrect: returnAttempt.questionsCorrect,
        totalQuestions: returnAttempt.totalQuestions,
        difficulty: returnAttempt.difficulty,
    });
});

export { quizAttemptsRouter };
