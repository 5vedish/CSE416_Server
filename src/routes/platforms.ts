import express from 'express';
import { parse } from 'path/posix';
import { db } from '../db';

const platformsRouter = express.Router();

const platformSortCriteria = ['title', 'rating'] as const;

type PlatformSortBy = typeof platformSortCriteria[number];

platformsRouter.get('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const queryTitle = req.query.title ? (req.query.title as string) : '';

    const take = req.query.per_page
        ? parseInt(req.query.per_page as string)
        : 5;

    const skip = req.query.page
        ? (parseInt(req.query.page as string) - 1) * take
        : 0;

    if (
        req.query.sort_by &&
        !platformSortCriteria.find((e) => e === req.query.sort_by)
    ) {
        return res.sendStatus(400);
    }

    const sortCriteria: PlatformSortBy = req.query.sort_by
        ? (req.query.sort_by as PlatformSortBy)
        : 'title';

    const descending =
        req.query.desc != undefined
            ? JSON.parse(req.query.desc as string)
            : false;

    const foundPlatforms = await db.platform.findMany({
        where: {
            title: {
                contains: queryTitle,
                mode: 'insensitive',
            },
        },
        select: {
            id: true,
            rating: true,
            likers: true,
            title: true,
            owner: {
                select: {
                    displayName: true,
                },
            },
        },
        orderBy: {
            [sortCriteria]: descending ? 'desc' : 'asc',
        },
        skip,
        take,
    });

    return res.json({ platforms: foundPlatforms });
});

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

    const numericId = parseInt(req.params.id);

    const platform = await db.platform.findFirst({
        where: {
            id: numericId,
        },
        include: {
            likers: true,
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

    if (!platform) {
        return res.sendStatus(404);
    }

    res.json({
        id: platform.id,
        title: platform.title,
        owner: platform.owner.displayName,
        quizzes: platform.quizzes,
        rating: platform.rating,
        likers: platform.likers,
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

platformsRouter.put('/:id/ratings', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { user } = req.session;
    const numericId = parseInt(req.params.id);
    const { rating } = req.body;
    const ratingValue = parseInt(rating);
    console.log(ratingValue);
    await db.platform
        .updateMany({
            where: {
                id: numericId,
            },
            data: {
                rating: ratingValue,
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
