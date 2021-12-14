import { db } from '../db';
import { hashPassword } from '../utils/auth';

const populateUsers = async () => {
    await db.user.createMany({
        data: [
            {
                id: 1,
                displayName: 'NASA',
                email: 'qiz@nasa.com',
                password: await hashPassword('password'),
                currency: 0,
                level: 1,
                experience: 0,
            },
        ],
    });

    await db.platform.create({
        data: {
            title: 'Planets',
            ownerId: 1,
            quizzes: {
                create: [
                    {
                        title: 'The Solar System',
                        difficulty: 'EASY',
                        maxTime: 60,
                        questions: {
                            create: [
                                {
                                    question:
                                        'How many planets are in the solar system?',
                                    choices: ['5', '6', '8', '10'],
                                    correctChoice: 2,
                                },
                                {
                                    question:
                                        'What is the largest planet in the solar system?',
                                    choices: [
                                        'Saturn',
                                        'Jupiter',
                                        'Mars',
                                        'Earth',
                                    ],
                                    correctChoice: 1,
                                },
                                {
                                    question:
                                        'Which planet in our solar system has massive rings that are easily visible with a small telescope?',
                                    choices: [
                                        'Saturn',
                                        'Jupiter',
                                        'Mars',
                                        'Uranus',
                                    ],
                                    correctChoice: 0,
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });
};

populateUsers();
