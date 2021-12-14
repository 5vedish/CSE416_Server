import { db } from '../db';

const deleteBadges = async () => {
    await db.user.deleteMany();
};

deleteBadges();
