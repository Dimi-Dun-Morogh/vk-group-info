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
    VkGrpInfo.getWPosts(String(start), String(end));
    console.log(start, end);
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.send(error).status(500);
  }
});

router.get('/offset', async (req: Request, res: Response) => {
  try {
    const offset = Utils.getOffset();
    res.status(200).send(offset);
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
    res.status(200).send()

  } catch (error) {
    console.error(error);
    res.status(500).send()
  }
})

router.get('/topcomment', async (req: Request, res: Response) => {
  try {

    const data = await VkGrpInfo.printTopComentator()
    res.status(200).send(data)

  } catch (error) {
    console.error(error);
    res.status(500).send()
  }
})

router.get('/topposters', async (req: Request, res: Response) => {
  try {

    const data = await VkGrpInfo.printTopPosters()
    res.status(200).send(data)

  } catch (error) {
    console.error(error);
    res.status(500).send()
  }
})

export default router;
