import express from 'express';
import { db } from '../db';

const rewardsRouter = express.Router({ mergeParams: true });

rewardsRouter.get('/', async (req, res) => {
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
        return res.sendStatus(500);
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

export { rewardsRouter };
