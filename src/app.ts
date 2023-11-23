import router from 'routes';
import cli from './cli';
import express from 'express';

import cors from 'cors';
import Db from 'db/Db';
import Utils from 'utils';
import vk from 'vk';

cli();

const web = express();
web.use(cors());
web.use(express.json());

web.use('/', router);

web.listen(3000);

(async () => {

  //await Db.initTables();
  //  await db.writePost();
 //Db.fetchTopPosts();
//  await Utils.getCommentsProgress();
  // await vk.countLikers('comment');
})()
