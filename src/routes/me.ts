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

meRouter.get('/platform', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const platform = await db.platform.findFirst({
        where: { ownerId: req.session.user.id },
    });
    console.log(platform);
    if (!platform) {
        return res.sendStatus(404);
    }
    return res.json({ platformId: platform.id });
});

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
    const { badgeId } = req.body;
    console.log(req.body);
    // console.log(badgeId);
    console.log('^');
    let badgeIdValue = parseInt(badgeId);
    console.log(badgeIdValue);

    const badge = await db.badge.findFirst({
        where: {
            id: badgeIdValue,
        },
    });

    if (badge) {
        if (user.currency < badge.cost) {
            res.sendStatus(400);
            return;
        }

        await db.badge.update({
            where: {
                id: badgeIdValue,
            },
            data: {
                owners: { connect: [{ id: user.id }] },
            },
            include: {
                owners: true,
            },
        });

        await db.user.updateMany({
            where: {
                id: user.id,
            },
            data: {
                currency: user.currency - badge.cost,
            },
        });
    }

    res.sendStatus(200);
});

meRouter.post('/rewards', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const { badgeId } = req.body;
    const { badgeName } = req.body;
    console.log(req.body);
    let badgeIdValue = parseInt(badgeId);

    await db.badge.upsert({
        where: {
            id: badgeIdValue,
        },
        update: {},
        create: {
            id: badgeIdValue,
            name: badgeName,
            description: `Platform ${badgeId}`,
            imageUrl: '/badges/blue.png',
        },
    });

    res.sendStatus(200);
});

export { meRouter };
