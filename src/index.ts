import express from 'express';
import cors from 'cors';

import { questionRouter } from './routes/question';
import { sessionRouter } from './routes/session';
import { userRouter } from './routes/user';

const app = express();
const port = process.env.PORT || 8080; // default port to listen

const corsOptions = {
    origin: process.env.CLIENT_ORIGIN!,
    credentials: true,
};

console.log(corsOptions);

app.use(cors(corsOptions));
app.options('*', cors);

app.use(express.json());
app.use('/questions', questionRouter);
app.use('/user', userRouter);
app.use('/sessions', sessionRouter);

// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server listening on ${port}`);
});
