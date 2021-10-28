import express from 'express';
import { db } from '../db';

const questionRouter = express.Router();

questionRouter.post('/', async (req, res) => {
    const { question, choices, correctChoice } = req.body;

    const correctChoiceIndex = parseInt(correctChoice);

    const result = await db.question.create({
        data: {
            question,
            choices,
            correctChoice: correctChoiceIndex,
        },
    });

    res.json({ id: result.id });
});

questionRouter.get('/:id', async (req, res) => {
    const numericId = parseInt(req.params.id);

    const questionToCheck = await db.question.findFirst({
        where: { id: numericId },
    });

    if (!questionToCheck) {
        res.sendStatus(404);
        return;
    }

    res.json(questionToCheck);
});

questionRouter.put('/:id', async (req, res) => {
    const numericId = parseInt(req.params.id);

    const { question } = req.body;

    await db.question
        .update({
            where: {
                id: numericId,
            },
            data: {
                question,
            },
        })
        .catch((e: any) => {
            res.sendStatus(404);
            return;
        });

    res.sendStatus(200);
});

questionRouter.delete('/:id', async (req, res) => {
    const numericId = parseInt(req.params.id);

    await db.question
        .delete({
            where: { id: numericId },
        })
        .catch((e: any) => {
            res.sendStatus(404);
            return;
        });

    res.sendStatus(200);
});

export { questionRouter };
