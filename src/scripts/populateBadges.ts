import { db } from '../db';

const populateBadges = async () => {
    await db.badge.createMany({
        data: [
            {
                name: 'Blue Badge',
                description: 'This badge is blue.',
                imageUrl: '/badges/blue.png',
                cost: 1000,
            },
            {
                name: 'Red Badge',
                description: 'This badge is red.',
                imageUrl: '/badges/red.png',
                cost: 500,
            },
            {
                name: 'Green Badge',
                description: 'This badge is green.',
                imageUrl: '/badges/green.png',
                cost: 250,
            },
        ],
    });
};

populateBadges();
