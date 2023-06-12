import router from 'routes';
import cli from './cli';
import express from 'express';

import cors from 'cors';


cli();

const web = express();
web.use(cors());
web.use(express.json());

web.use('/',router);


web.listen(3000);

