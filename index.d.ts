declare namespace Express {
    interface Request {
        session?: import('.prisma/client').Session;
    }
}
