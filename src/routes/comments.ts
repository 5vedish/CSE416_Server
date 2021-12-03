import express from 'express';
import { db } from '../db';

const commentsRouter = express.Router();

commentsRouter.post('/:platformId', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;

    const platformId = parseInt(req.params.platformId);

    const { content } = req.body;

    await db.comment.create({
        data: {
            content,
            platformId,
            authorId: user.id,
        },
    });

    return res.sendStatus(200);
});

commentsRouter.put('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const commentId = req.params.id;

    const { content } = req.body;
    console.log(content);

    await db.comment
        .updateMany({
            where: {
                id: parseInt(commentId),
            },
            data: {
                content,
            },
        })
        .catch((e: any) => {
            console.log(e);
            res.sendStatus(404);
            return;
        });

    res.sendStatus(200);
});

commentsRouter.delete('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const commentId = parseInt(req.params.id);

    await db.comment
        .deleteMany({ where: { id: commentId } })
        .catch((e: any) => {
            console.log(e);
            res.sendStatus(404);
            return;
        });

    res.json(200);
});

export { commentsRouter };
