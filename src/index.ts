import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { passwordResetRouter } from './routes/passwordResets';
import { questionRouter } from './routes/questions';
import { sessionRouter } from './routes/sessions';
import { meRouter } from './routes/me';
import { userRouter } from './routes/users';
import { errHandler } from './middleware/err';
import { authHandler } from './middleware/auth';
import { platformsRouter } from './routes/platforms';
import { quizzesRouter } from './routes/quizzes';
import { quizAttemptsRouter } from './routes/quizAttempts';
import { rewardsRouter } from './routes/rewards';

const app = express();
let port = process.env.PORT || 8080; // default port to listen

const corsOptions = {
    origin: process.env.CLIENT_ORIGIN!,
    credentials: true,
};

app.enable('trust proxy');
app.use(cors(corsOptions));
app.options('*', cors);

app.use(express.json());

app.use(cookieParser());
app.use(authHandler);

app.use('/questions', questionRouter);
app.use('/platforms', platformsRouter);
app.use('/users', userRouter);
app.use('/sessions', sessionRouter);
app.use('/me', meRouter);
app.use('/password_resets', passwordResetRouter);
app.use('/quizzes', quizzesRouter);
app.use('/attempts', quizAttemptsRouter);
app.use('/rewards', rewardsRouter);

app.use(errHandler);

// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server listening on ${port}`);
});
