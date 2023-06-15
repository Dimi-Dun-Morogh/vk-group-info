import config from 'config';
import express, { Request, Response } from 'express';
import Utils from 'utils';
import VkGrpInfo from '../vk';

const router = express.Router();

router.get('/wallposts', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      res.status(400).send('wrong dates');
      return;
    }
    console.log(start, end);
    Utils.wipeTemp();
    VkGrpInfo.getWPosts(String(start), String(end));

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.send(error).status(500);
  }
});

router.get('/datastatus', async (req: Request, res: Response) => {
  try {
    const postDates = VkGrpInfo.postDates();
    let groupStr= '';
    const data = {} as {[key:string]:string};
    const grpInfo = await VkGrpInfo.grpInfo();
    if(grpInfo) {
      groupStr = `\n[${grpInfo.name} - id ${grpInfo.id}]`
      data.text = postDates+groupStr;
      data.img = grpInfo.photo_200
      data.status = postDates
    }
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.send(error).status(500);
  }
});

router.get('/envstatus', async (req: Request, res: Response) => {
  try {

    res.status(200).send(config);
  } catch (error) {
    console.error(error);
    res.send(error).status(500);
  }
});


router.get('/offset', async (req: Request, res: Response) => {
  try {
    const offset = Utils.getOffset();
    const posts = Utils.readPostsCSV();
    let dateStr = 'Пока что постов не найдено';
    if (posts && posts[posts.length - 2]) {
      const [, , date] = posts[posts.length - 2].split(',');
      dateStr = new Date(+date * 1000).toLocaleDateString('Ru-ru');
    }

    res.status(200).send(`${dateStr}&${offset}`);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.get('/topposts', async (req: Request, res: Response) => {
  try {
    const { filter } = req.query;
    if (filter == 'likes' || filter == 'comments') {
      const data = await VkGrpInfo.printTop10posts(filter);
      res.status(200).send(data);
      return;
    } else {
      res.status(400).send('wrong filter');
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.get('/countcomments', async (req: Request, res: Response) => {
  try {
    VkGrpInfo.countComments();
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

router.get('/topcomment', async (req: Request, res: Response) => {
  try {
    const data = await VkGrpInfo.printTopComentator();
    if(data ==='no comments') return  res.status(200).send({err:data});
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

router.get('/topposters', async (req: Request, res: Response) => {
  try {
    const data = await VkGrpInfo.printTopPosters();
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

export default router;
