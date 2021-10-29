import express from 'express';
import { db } from '../db';

const questionRouter = express.Router();

questionRouter.post('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const { question, choices, correctChoice } = req.body;

    const correctChoiceIndex = parseInt(correctChoice);

    const result = await db.question.create({
        data: {
            question,
            choices,
            correctChoice: correctChoiceIndex,
            userId: user.id,
        },
    });

    res.json({ id: result.id });
});

questionRouter.get('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const numericId = parseInt(req.params.id);

    const questionToCheck = await db.question.findFirst({
        where: {
            id: numericId,
            userId: user.id,
        },
    });

    if (!questionToCheck) {
        res.sendStatus(404);
        return;
    }

    res.json(questionToCheck);
});

questionRouter.put('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const numericId = parseInt(req.params.id);

    const { question, choices, correctChoice } = req.body;

    const correctChoiceIndex = parseInt(correctChoice);

    await db.question
        .update({
            where: {
                id: numericId,
                userId: user.id,
            },
            data: {
                question,
                choices,
                correctChoice: correctChoiceIndex,
            },
        })
        .catch((e: any) => {
            res.sendStatus(404);
            return;
        });

    res.sendStatus(200);
});

questionRouter.delete('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const numericId = parseInt(req.params.id);

    await db.question
        .delete({
            where: {
                id: numericId,
                userId: user.id,
            },
        })
        .catch((e: any) => {
            res.sendStatus(404);
            return;
        });

    res.sendStatus(200);
});

export { questionRouter };
