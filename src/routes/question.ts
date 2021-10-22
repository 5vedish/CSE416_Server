import express from 'express';
import { db } from '../db';

const questionRouter = express.Router();

questionRouter.post("/", async (req, res) => {
    const { question, choices, correctChoice } = req.body;
    const correctChoiceIndex = parseInt(correctChoice);
    const result = await db.question.create({
        data: {
            question,
            choices,
            correctChoice: correctChoiceIndex
        }
    });
    res.json({ id: result.id });
});

questionRouter.get("/:id", async (req, res) => {
    const numericId = parseInt(req.params.id);

    const questionToCheck = await db.question.findFirst({
        where: { id: numericId }
    });
    if (!questionToCheck) {
        res.status(404);
        return;
    }
    res.json({ correctChoice: questionToCheck.correctChoice});
});

export { questionRouter };