import express from 'express';
import { db } from '../db';

import { hashPassword } from '../utils/auth';
import { getUserById } from './users';

const meRouter = express.Router();

meRouter.get('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    return res.json(await getUserById(req.session.user.id));
});

// meRouter.get('/platform', async (req, res) => {
//     if (!req.session) {
//         return res.sendStatus(401);
//     }
//     const platform = await db.platform.findFirst({
//         where: { ownerId: req.session.user.id },
//     });
//     console.log(platform);
//     if (!platform) {
//         return res.sendStatus(404);
//     }
//     return res.json({ platformId: platform.id });
// });

meRouter.get('/rewards', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const { user } = req.session;

    const foundUser = await db.user.findFirst({
        where: {
            id: user.id,
        },
        select: {
            badges: true,
        },
    });
    if (!foundUser) {
        return res.sendStatus(400);
    }

    const badgeMap = foundUser.badges
        .map((badge) => badge.id)
        .reduce(
            (acc: { [key: number]: number }, curr) => ((acc[curr] = 1), acc),
            {},
        );

    const badges = await db.badge.findMany();

    return res.json({
        badges: badges.map((badge) => ({
            badge,
            owned: badge.id in badgeMap,
        })),
    });
});

meRouter.delete('/sessions', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    await db.session.delete({ where: { id: req.session.id } });
    res.clearCookie('sessionId');
    return res.sendStatus(200);
});

meRouter.patch('/', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }

    const { displayName, email, password } = req.body;

    if (password) {
        await db.user.update({
            where: { id: req.session.user.id },
            data: {
                password: await hashPassword(password),
            },
        });
    } else {
        await db.user.update({
            where: { id: req.session.user.id },
            data: {
                displayName,
                email,
            },
        });
    }

    return res.sendStatus(200);
});

meRouter.get('/rewards', async (req, res) => {
    console.log('GETTING REWARDS');
    if (!req.session) {
        return res.sendStatus(401);
    }

    return res.json(
        await db.user.findFirst({
            where: {
                id: req.session?.user.id,
            },
            select: {
                // badges: true,
            },
        }),
    );
});

meRouter.put('/rewards', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const { user } = req.session;
    const { badges } = req.body;

    await db.user
        .updateMany({
            where: {
                id: user.id,
            },
            data: {
                // badges: badges,
            },
        })
        .catch((e: any) => {
            console.log(e);
            res.sendStatus(404);
            return;
        });

    res.sendStatus(200);
});

export { meRouter };
