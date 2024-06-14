import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

import router from './routes/user.router.js';

app.use("/api/v1/users", router);

export default app;