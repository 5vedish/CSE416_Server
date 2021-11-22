import { db } from '../db';

const deleteBadges = async () => {
    await db.badge.deleteMany();
};

deleteBadges();
