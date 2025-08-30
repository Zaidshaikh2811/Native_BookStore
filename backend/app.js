import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cors from 'cors';
import {config} from "./config/index.js";

import users from './routes/users.js';
import properties from './routes/properties.js';
import auth from './routes/Auth.js';
import { errorHandler } from './middlewares/errorHandler.js';


const app = express();



// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));

// Routes

app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/properties', properties);

// Error Handler
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`🚀 Server running in ${config.env} mode at http://localhost:${config.port}`);
});

export default app;
