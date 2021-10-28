declare namespace Express {
    interface Request {
        session?: import('.prisma/client').Session & {
            user: import('.prisma/client').User;
        };
    }
}
