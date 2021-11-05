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

    const platformToCheck = await db.platform.findFirst({
        where: {
            id: numericId,
            ownerId: user.id,
        },
    });

    if (!platformToCheck) {
        return res.sendStatus(404);
    }

    res.json(platformToCheck);
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
