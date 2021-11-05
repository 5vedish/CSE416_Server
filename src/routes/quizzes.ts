import express from 'express';
import { db } from '../db';
import { quizAttemptsRouter } from './quizAttempts';

const quizzesRouter = express.Router();

quizzesRouter.use('/:id/attempts', quizAttemptsRouter);

quizzesRouter.post('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { platformId } = req.body;

    const result = await db.quiz.create({
        data: {
            difficulty: 'Easy',
            platformId: platformId,
            title: 'New Quiz',
            maxTime: 60,
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
    });

    if (!quiz) {
        return res.sendStatus(404);
    }

    res.json(quiz);
});

quizzesRouter.put('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { quizId, newTitle, newDifficulty } = req.body;

    const updated = await db.quiz
        .updateMany({
            where: {
                id: quizId,
            },
            data: {
                title: newTitle,
                difficulty: newDifficulty,
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
