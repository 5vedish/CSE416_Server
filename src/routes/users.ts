import express, { query } from 'express';
import { db } from '../db';

import { hashPassword } from '../utils/auth';

const getUserById = async (id: number) => {
    return await db.user.findFirst({
        where: {
            id: id,
        },
        select: {
            displayName: true,
            currency: true,
            experience: true,
            level: true,
            createdPlatforms: {
                select: {
                    id: true,
                    title: true,
                    rating: true,
                },
            },
            badges: true,
        },
    });
};

const userRouter = express.Router();

const userSortCriteria = ['displayName', 'currency', 'level'] as const;

type UserSortBy = typeof userSortCriteria[number];

userRouter.get('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const queryName = req.query.name ? (req.query.name as string) : '';

    const take = req.query.per_page
        ? parseInt(req.query.per_page as string)
        : 5;

    const skip = req.query.page
        ? (parseInt(req.query.page as string) - 1) * take
        : 0;

    if (
        req.query.sort_by &&
        !userSortCriteria.find((e) => e === req.query.sort_by)
    ) {
        return res.sendStatus(400);
    }

    const sortCriteria: UserSortBy = req.query.sort_by
        ? (req.query.sort_by as UserSortBy)
        : 'displayName';

    const descending =
        req.query.desc != undefined
            ? JSON.parse(req.query.desc as string)
            : false;

    const foundUsers = await db.user.findMany({
        where: {
            displayName: {
                contains: queryName,
                mode: 'insensitive',
            },
        },
        select: {
            id: true,
            displayName: true,
            currency: true,
            experience: true,
            level: true,
        },
        orderBy: {
            [sortCriteria]: descending ? 'desc' : 'asc',
        },
        skip,
        take,
    });

    return res.json({ users: foundUsers });
});

userRouter.post('/', async (req, res) => {
    const { displayName, email, password } = req.body;

    console.log(req.body);

    await db.user.create({
        data: {
            displayName: displayName,
            email: email,
            password: await hashPassword(password),
            currency: 0,
            level: 1,
            experience: 0,
        },
    });

    res.sendStatus(200);
});

userRouter.get('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const userId = parseInt(req.params.id);

    const user = await getUserById(userId);

    return res.json(user);
});

userRouter.put('/rewards/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const userId = parseInt(req.params.id);

    const user = await getUserById(userId);

    console.log(user);

    const { currency, experience } = req.body;
    console.log(req.body);

    if (user) {
        console.log('hit');
        console.log(currency, ',', experience);
        const numCurrency = parseInt(currency) + user.currency;
        const numExp = parseInt(experience) + user.experience;

        console.log(numCurrency, ',', numExp);

        await db.user.updateMany({
            where: {
                id: userId,
            },
            data: {
                currency: numCurrency,
                experience: numExp,
            },
        });
    }

    return res.json(user);
});

export { userRouter, getUserById };
