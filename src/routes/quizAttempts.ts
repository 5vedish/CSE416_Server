import express from 'express';
import { db } from '../db';

const quizAttemptsRouter = express.Router({ mergeParams: true });

quizAttemptsRouter.post('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const params = req.params as { id: string };
    const quizId = parseInt(params.id);

    const quiz = db.quiz.findFirst({
        where: { id: quizId },
        include: {
            platform: {
                select: {
                    ownerId: true,
                },
            },
        },
    });
    if (!quiz) {
        return res.sendStatus(404);
    }
});

export { quizAttemptsRouter };
