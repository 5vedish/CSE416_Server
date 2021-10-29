import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { questionRouter } from './routes/question';
import { sessionRouter } from './routes/session';
import { meRouter } from './routes/me';
import { userRouter } from './routes/user';
import { errHandler } from './middleware/err';
import { authHandler } from './middleware/auth';

const app = express();
const port = process.env.PORT || 8080; // default port to listen

const corsOptions = {
    origin: process.env.CLIENT_ORIGIN!,
    credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors);

app.use(express.json());

app.use(cookieParser());
app.use(authHandler);

app.use('/questions', questionRouter);
app.use('/user', userRouter);
app.use('/sessions', sessionRouter);
app.use('/me', meRouter);

app.use(errHandler);

// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server listening on ${port}`);
});
