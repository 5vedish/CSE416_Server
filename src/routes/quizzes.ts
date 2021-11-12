import express from 'express';
import { db } from '../db';
import { quizAttemptsRouter } from './quizAttempts';

const quizzesRouter = express.Router();

quizzesRouter.use('/:quizId/attempts', quizAttemptsRouter);

quizzesRouter.post('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { platformId } = req.body;

    console.log('CREATE QUIZ FROM BACKEND');

    const result = await db.quiz.create({
        data: {
            difficulty: 'EASY',
            platformId: platformId,
            title: 'New Quiz',
            maxTime: 60,
            questions: {
                create: {
                    question: 'What is the question you want to ask?',
                    choices: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
                    correctChoice: 0,
                },
            },
        },
    });

    res.json({ quizId: result.id });
});

quizzesRouter.get('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const quizId = parseInt(req.params.id);

    const quiz = await db.quiz.findFirst({
        where: {
            id: quizId,
        },
        include: {
            questions: true,
        },
    });

    if (!quiz) {
        return res.sendStatus(404);
    }

    res.json(quiz);
});

quizzesRouter.put('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const quizId = req.params.id;

    const { title, difficulty, totalTime } = req.body;

    console.log(quizId, title);

    const updated = await db.quiz
        .updateMany({
            where: {
                id: parseInt(quizId),
            },
            data: {
                title: title,
                difficulty: difficulty,
                maxTime: parseInt(totalTime),
            },
        })
        .catch((e: any) => {
            console.log(e);
            res.sendStatus(404);
            return;
        });

    res.json(updated);
});

quizzesRouter.delete('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const quizId = parseInt(req.params.id);

    console.log(quizId);

    const deleted = await db.quiz
        .deleteMany({ where: { id: quizId } })
        .catch((e: any) => {
            console.log(e);
            res.sendStatus(404);
            return;
        });

    res.json(200);
});

export { quizzesRouter };
