import express from 'express';
import { db } from '../db';

const platformsRouter = express.Router();

platformsRouter.post('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const { title } = req.body;

    const result = await db.platform.create({
        data: {
            title: title,
            ownerId: user.id,
        },
    });

    res.json({ id: result.id });
});

platformsRouter.get('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const numericId = parseInt(req.params.id);

    const platform = await db.platform.findFirst({
        where: {
            id: numericId,
            ownerId: user.id,
        },
        include: {
            owner: {
                select: {
                    displayName: true,
                },
            },
            quizzes: {
                select: {
                    id: true,
                    difficulty: true,
                    maxTime: true,
                    title: true,
                    questions: true,
                },
            },
        },
    });
    console.log(platform);

    if (!platform) {
        return res.sendStatus(404);
    }

    res.json({
        title: platform.title,
        owner: platform.owner.displayName,
        quizzes: platform.quizzes,
    });
});

platformsRouter.get('/:id/ratings', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const numericId = parseInt(req.params.id);

    const platform = await db.platform.findFirst({
        where: {
            id: numericId,
            ownerId: user.id,
        },
    });
    console.log(platform);

    if (!platform) {
        return res.sendStatus(404);
    }

    res.json({
        rating: platform.rating,
    });
});

platformsRouter.put('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const numericId = parseInt(req.params.id);

    const { title } = req.body;

    await db.platform
        .updateMany({
            where: {
                id: numericId,
                ownerId: user.id,
            },
            data: {
                title: title,
                ownerId: user.id,
            },
        })
        .catch((e: any) => {
            console.log(e);
            res.sendStatus(404);
            return;
        });

    res.sendStatus(200);
});

platformsRouter.put('/:id/ratings/:rating', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const numericId = parseInt(req.params.id);
    const rating = parseInt(req.params.rating);

    await db.platform
        .updateMany({
            where: {
                id: numericId,
                ownerId: user.id,
            },
            data: {
                rating: rating,
            },
        })
        .catch((e: any) => {
            console.log(e);
            res.sendStatus(404);
            return;
        });

    res.sendStatus(200);
});

platformsRouter.delete('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    console.log(req.params, req.session);
    const numericId = parseInt(req.params.id);

    await db.platform
        .deleteMany({
            where: {
                id: numericId,
                ownerId: user.id,
            },
        })
        .catch((e: any) => {
            console.log(e);
            res.sendStatus(404);
            return;
        });

    res.sendStatus(200);
});

export { platformsRouter };
