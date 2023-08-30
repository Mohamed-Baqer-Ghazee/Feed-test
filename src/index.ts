import dotenv from 'dotenv';
dotenv.config();
import express, {  Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import errorHnadler from './middleWares/errorHandler.middleWare';
import routes from './routes/router';
import bodyParser from 'body-parser';
import limiter from './config/limiter.config';
import cors from 'cors'


const app = express();

const corsOptions = {
  origin: 'http://localhost:3001', // Your React frontend's URL
};

app.use(cors(corsOptions));
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api',routes);
app.use(limiter);
app.use(errorHnadler);
app.use(helmet({ crossOriginEmbedderPolicy: false, originAgentCluster: true }));
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data: blob:"],
    },
  })
);


app.use((res: Response) => {
  res.status(404).json({ error: '404 Not found' });
});

app.use((err: any, res: Response) => {
  console.error(err);
  res.status(500).json({ error: '500 Internal server error' });
});


const port = process.env.port;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

