import express, { query } from 'express';
import { db } from '../db';

import { hashPassword } from '../utils/auth';

const userRouter = express.Router();

const userSortCriteria = [
    'displayName',
    'currency',
    'level',
    'experience',
] as const;

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

    const descending = Boolean(req.query.desc);

    const foundUsers = await db.user.findMany({
        where: {
            displayName: {
                contains: queryName,
                mode: 'insensitive',
            },
        },
        select: {
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
            currency: 69420,
            level: 54,
            experience: 55000,
        },
    });

    res.sendStatus(200);
});

userRouter.get('/:id', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    return res.status(200).json({
        displayName: req.session.user.displayName,
        currency: req.session.user.currency,
        experience: req.session.user.experience,
        level: req.session.user.level,
    });
});

export { userRouter };
