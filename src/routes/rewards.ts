import express from 'express';
import { db } from '../db';

const rewardsRouter = express.Router({ mergeParams: true });

rewardsRouter.get('/:userId', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const { userId } = req.params;

    const numericUserId = parseInt(userId);

    const foundUser = await db.user.findFirst({
        where: {
            id: numericUserId,
        },
        select: {
            displayName: true,
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
        owner: foundUser.displayName,
        badges: badges.map((badge) => ({
            badge,
            owned: badge.id in badgeMap,
        })),
    });
});

rewardsRouter.put('/:userId', async (req, res) => {
    if (!req.session) {
        return res.sendStatus(401);
    }
    const { badges } = req.body;

    const { userId } = req.params;

    const numericUserId = parseInt(userId);

    const updated = await db.user
        .updateMany({
            where: {
                id: numericUserId,
            },
            data: {
                badges: badges,
            },
        })
        .catch((e: any) => {
            console.log(e);
            res.sendStatus(404);
            return;
        });

    res.json(updated);
});

export { rewardsRouter };
