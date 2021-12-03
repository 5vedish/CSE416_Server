import { Prisma } from '.prisma/client';
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
            averageRating: true,
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

    const platformId = parseInt(req.params.id);

    const platform = await db.platform.findFirst({
        where: {
            id: platformId,
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
            comments: {
                select: {
                    id: true,
                    author: {
                        select: { id: true, displayName: true },
                    },
                    content: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
        },
    });
    if (!platform) {
        return res.sendStatus(404);
    }

    const userRating = await db.rating.findFirst({
        where: {
            userId: req.session.user.id,
            platformId,
        },
    });
    res.json({
        id: platform.id,
        title: platform.title,
        owner: platform.owner.displayName,
        quizzes: platform.quizzes,
        averageRating: platform.averageRating,
        likers: platform.likers,
        yourRating: userRating ? userRating.rating : 0,
        comments: platform.comments,
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
    const platformId = parseInt(req.params.id);
    const { rating } = req.body;
    const ratingValue = parseInt(rating);

    const platform = await db.platform.findUnique({
        where: { id: platformId },
    });
    if (!platform) {
        return res.sendStatus(404);
    }

    await db.rating.upsert({
        where: {
            id: `${platformId}_${user.id}`,
        },
        update: {
            rating: ratingValue,
        },
        create: {
            id: `${platformId}_${user.id}`,
            rating: ratingValue,
            platformId: platformId,
            userId: user.id,
        },
    });

    const aggregations = await db.rating.aggregate({
        where: {
            platformId,
        },
        _avg: {
            rating: true,
        },
    });

    console.log(aggregations);

    await db.platform.update({
        where: { id: platformId },
        data: {
            averageRating: aggregations._avg.rating ?? 0,
        },
    });

    res.sendStatus(200);
});

platformsRouter.put('/:platform_id/likes', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const { user } = req.session;
    const platformId = parseInt(req.params.platform_id);
    await db.platform.update({
        where: {
            id: platformId,
        },
        data: {
            likers: { connect: [{ id: user.id }] },
        },
        include: {
            likers: true,
        },
    });

    res.sendStatus(200);
});

platformsRouter.delete('/:platform_id/likes', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const { user } = req.session;
    const platformId = parseInt(req.params.platform_id);
    await db.platform.update({
        where: {
            id: platformId,
        },
        data: {
            likers: { disconnect: [{ id: user.id }] },
        },
        include: {
            likers: true,
        },
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
