import { db } from '../db';

const populateBadges = async () => {
    await db.badge.createMany({
        data: [
            {
                name: 'Blue Badge',
                description: 'This badge is blue.',
                imageUrl: '/badges/blue.png',
            },
            {
                name: 'Red Badge',
                description: 'This badge is red.',
                imageUrl: '/badges/red.png',
            },
            {
                name: 'Green Badge',
                description: 'This badge is green.',
                imageUrl: '/badges/green.png',
            },
        ],
    });
};

populateBadges();
