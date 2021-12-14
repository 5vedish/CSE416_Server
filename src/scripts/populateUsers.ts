import { db } from '../db';
import { hashPassword } from '../utils/auth';

const populateUsers = async () => {
    await db.user.createMany({
        data: [
            {
                id: 100,
                displayName: 'NASA',
                email: 'qiz@nasa.com',
                password: await hashPassword('password'),
                currency: 0,
                level: 1,
                experience: 0,
            },
            {
                id: 101,
                displayName: 'Marvelous',
                email: 'captain@marvelous.com',
                password: await hashPassword('strongestAvenger'),
                currency: 10000,
                level: 5,
                experience: 10000,
            },
        ],
    });

    await db.platform.create({
        data: {
            title: 'Planets',
            ownerId: 100,
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

    await db.platform.create({
        data: {
            title: 'Marvel Cinematic Universe',
            ownerId: 101,
            quizzes: {
                create: [
                    {
                        title: 'Infinity War',
                        difficulty: 'EASY',
                        maxTime: 60,
                        questions: {
                            create: [
                                {
                                    question:
                                        'Where does the Collector reside?',
                                    choices: [
                                        'Knowhere',
                                        'Nidavellir',
                                        'Earth',
                                        'Wakanda',
                                    ],
                                    correctChoice: 0,
                                },
                                {
                                    question:
                                        'Who did Captain America leave his shield to?',
                                    choices: [
                                        'Sam Wilson',
                                        'Bucky Barnes',
                                        'Stan Lee',
                                        'Jack Kirby',
                                    ],
                                    correctChoice: 0,
                                },
                                {
                                    question:
                                        'Which direction did Peter Quill tell Gamora she should have gone?',
                                    choices: ['Left', 'Right', 'Up', 'Down'],
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
