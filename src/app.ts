import router from 'routes';
import cli from './cli';
import express from 'express';

import cors from 'cors';
import Utils from 'utils';

cli();

const web = express();

web.use(express.json());

web.use('/',router);

web.use(cors());
web.listen(3000);

