import config from 'config';
import { ItemPost, ResponseWall, ResponseWallExec } from 'types';
import Utils from 'utils';

const { vk_grp_id, vk_token } = config;

class VkGrpInfo {
  postCount;

  constructor(postCount: number) {
    this.postCount = postCount;
  }

  async getWPosts() {
    try {
      const offset = Number(Utils.getOffset());
      console.log('getWPosts', `current OFFSET IS ${offset}`);
      if (offset === 0) console.time('getWPosts');
      const nextOffset = offset + 300;
      const vkScript = `
      var data = [];
      var step = ${offset};
      while (step < ${nextOffset}) {
        var res = API.wall.get({
          owner_id: ${vk_grp_id},
          offset: step,
          count: 100
        });
        var arrLen = res.items.length;
        var i = 0;
        while (i < arrLen) {
          var post = res.items[i];

          data.push(post);
          i = i + 1;
        }

        step = step + 100;
      }
      return data;
      `;

      const url = `https://api.vk.com/method/execute?&code=${encodeURIComponent(
        vkScript,
      )}&access_token=${vk_token}&v=5.131`;

      const data: ResponseWallExec = await fetch(url).then((d) => d.json());
      const reachedDate = data.response.some((p) => this.dateReached(p));
      data.response.forEach((p) => {
        const toDrop = this.dateReached(p);
        if(toDrop) return;
     //   if(reachedDate) return;
        Utils.writeCSV(p)
      });

      //! здесь прочекать на то что дата последнего поста не меньше первого числа 00 ночи этого месяца

      if(reachedDate) {
        console.timeEnd('getWPosts');
        this.postDates();
        return;
      }
      Utils.writeOffset(nextOffset);
      await Utils.waiter();
      this.getWPosts();
    } catch (error) {
      console.error(error);
    }
  }

 private dateReached(post: ItemPost) {
    const postDate = Number(post.date + '000');
    const pinned = post.is_pinned
    const date = new Date(),
      y = date.getFullYear(),
      m = date.getMonth();
    const firstDay = Number(new Date(y, m, 1));
    return firstDay > postDate && !pinned;
  }

  postDates() {
    const posts = Utils.readPostsCSV();
    const lastPost = posts[posts.length - 2];
    const lastDate = new Date(
      Number(lastPost.split(',')[2] + '000'),
    ).toLocaleDateString('Ru-ru');
    const firstPostdate = posts.reduce((acc, p) => {
      const date = p.split(',')[2];
      if (Number(date) > acc) acc = Number(date);
      return acc;
    }, 0);
    const firstDate = new Date(
      Number(firstPostdate + '000'),
    ).toLocaleDateString('Ru-ru');
    console.log(`${firstDate} -  ${lastDate}  -  даты записанных постов
всего постов - ${posts.length - 1}`);
  }
}

export default new VkGrpInfo(3000);
