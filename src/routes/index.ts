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
    const postDates =  await VkGrpInfo.postDates();
    let groupStr= '';
    const data = {} as {[key:string]:string};
    const grpInfo = await VkGrpInfo.grpInfo();
    if(grpInfo) {
      groupStr = `\n[${grpInfo.name} - id ${grpInfo.id}]`
      data.text = postDates+groupStr;
      data.img = grpInfo.photo_200
      data.status =  postDates
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
    const offset = await Utils.getOffset();
    const dateStr = await VkGrpInfo.postDates();

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

router.get('/bychars', async (req: Request, res: Response) => {
  try {
    const { filter } = req.query;
    if (filter == 'posts' || filter == 'comments') {
      const data = filter == 'posts' ? await VkGrpInfo.topPostersByChar()
      : await VkGrpInfo.topCommentatorsByChar();
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
    const status = Utils.readCommentsStatus();
    if(status !=='ok') {
      const progress = await Utils.getCommentsProgress();
      return  res.status(200).send({err:status, progress:progress})
    }
    const { filter } = req.query;
    console.log(filter)
    if(filter == 'comments_count' || filter == 'total_likes') {
      const data = await VkGrpInfo.printTopComentator(filter);

      res.status(200).send(data);
    }

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

router.get('/alltop1', async(req:Request, res: Response)=>{
  try {
    const data = await VkGrpInfo.allTop1s();
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
}})

export default router;
