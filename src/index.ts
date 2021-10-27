import express from 'express';
import cors from 'cors';

import { questionRouter } from './routes/question';

const app = express();
const port = process.env.PORT || 8080; // default port to listen

const corsOptions = {
    // origin: process.env.CLIENT_ORIGIN,
    origin: '*',
    credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors);

app.use(express.json());
app.use('/questions', questionRouter);

// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server listening on ${port}`);
});
