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
        return res.sendStatus(404);
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
        .updateMany({
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
            console.log(e);
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
    console.log(req.params, req.session);
    const numericId = parseInt(req.params.id);

    await db.question
        .deleteMany({
            where: {
                id: numericId,
                userId: user.id,
            },
        })
        .catch((e: any) => {
            console.log(e);
            res.sendStatus(404);
            return;
        });

    res.sendStatus(200);
});

export { questionRouter };
