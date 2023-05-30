import config from 'config';
import {
  CommentsResponse,
  ItemPost,
  PostGetById,
  ResponseWall,
  ResponseWallExec,
  Thread,
  ThreadResponse,
  VkErr,
} from 'types';
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
        if (toDrop) return;
        //   if(reachedDate) return;
        Utils.writeCSV(p);
      });

      //! здесь прочекать на то что дата последнего поста не меньше первого числа 00 ночи этого месяца

      if (reachedDate) {
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
    const pinned = post.is_pinned;
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

  async top10Posts(filter: 'likes' | 'comments') {
    try {
      const serialize = Utils.readPostsCSV()
        .map((el) => {
          const [id, from_id, date, likes, comments] = el.split(',');
          return {
            id,
            from_id,
            date,
            likes,
            comments,
          };
        })
        .sort((a, b) => +b[filter] - +a[filter])
        .slice(0, 9);

      //! тут полчить инфо о посте чтоб вписать нейм юзера и ссылку на пост
      const postIds = serialize.reduce(
        (acc, item) => (acc += `${config.vk_grp_id}_${item.id}, `),
        '',
      );
      const url = `https://api.vk.com/method/wall.getById?v=5.131&access_token=${config.vk_token}&posts=${postIds}&extended=1`;
      const data: PostGetById = await fetch(url).then((d) => d.json());

      const res = serialize.map((item) => {
        const author = data.response.profiles.find(
          (el) => el.id === +item.from_id,
        );
        return {
          ...item,
          author_name: `${author?.first_name} ${author?.last_name}`,
          avatar: author?.photo_50,
          link: `${config.vk_grp_id}_${item.id}`,
        };
      });
      return res;
    } catch (error) {
      console.error(error);
    }
  }

  async countComments() {
    try {
      console.time('countComments');
      const posts = Utils.readPostsCSV();
      const postIds = posts.slice(0, posts.length - 1).map((el) => {
        const [id] = el.split(',');
        return id;
      });

      const res = {} as {[key:number]: number};

      for(const postId of postIds) {
        console.timeLog('countComments', postId)
        const data = await this.vkScriptComments(+postId,0);

        if (!data || 'error' in data) continue;

       // console.log(data)
        const count = data.response.count;

        for (let i = 0; i < count + 100; i += 100) {
          let loopData;
          if ((i === 0)) loopData = data;
          else {
            loopData = await this.vkScriptComments(+postId, i);
            await Utils.waiter(1000);
          }

          if(!loopData || loopData.response.items.length === 0) break;
          const {items} = loopData.response;

          // loop thru items to fill in ress object and to find thread objects
          for(let j = 0; j < items.length; j ++) {
            const {from_id, thread, id} = items[j];
            res[from_id] = res[from_id]?  res[from_id]+ 1 : 1;
            //hande comment thread
            if(thread.count > 0) {
              const threadComments = await this.commentThread(thread, id);
              Object.entries(threadComments!).forEach(([f_id, num])=>{
                const key = Number(f_id);
                res[key] = res[key] ?  res[key] + num : num;
              })
            }
          }
        }
      }
     // console.log(res);
      Utils.writeCommentsJson(res);
      console.timeEnd('countComments');
    } catch (error) {
      console.error(error);
    }
  }

  private async commentThread(thread : Thread, commentId: number) {
    try {
      const res = {} as {[key:number]: number};
      const {items, count} = thread;
      if(count <=10) {
        items.forEach(el=> res[el.from_id] = res[el.from_id]?  res[el.from_id]+ 1 : 1);
        return res;
      }

      // create loop based on count and iterate to fetch all comments with OFFset in vk script
      for(let i = 0; i < count + 100; i += 100) {
        const data = await this.vkScriptThreads(3295343, commentId, i);
        data?.response.items.forEach(el=> res[el.from_id] = res[el.from_id]?  res[el.from_id]+ 1 : 1);
        await Utils.waiter(2000);
      }
      return res;
    } catch (error) {
      console.error(error)
    }
  }

  private async vkScriptThreads(postId: number, commentId: number, offset:number) {
    try {
      const vkScript = `var grpId = ${config.vk_grp_id};
      var postId = ${postId};
      var rootData = API.wall.getComments({owner_id:grpId, post_id: postId, offset: ${offset}, thread_items_count: 10, count: 100, comment_id: ${commentId}});
      var commentsCount = rootData.response.count;


      return rootData;`;

      const url = `https://api.vk.com/method/execute?&code=${encodeURIComponent(
        vkScript,
      )}&access_token=${vk_token}&v=5.91`;

      const data: ThreadResponse = await fetch(url).then((d) => d.json());
      return data;
    } catch (error) {
      console.error(error)
    }
  }

  private async vkScriptComments(postId: number, offset:number){
    try {
      const vkScript = `var grpId = ${config.vk_grp_id};
      var postId = ${postId};
      var rootData = API.wall.getComments({owner_id:grpId, post_id: postId, offset: ${offset}, thread_items_count: 10, count: 100});
      var commentsCount = rootData.response.count;


      return rootData;`;

      const url = `https://api.vk.com/method/execute?&code=${encodeURIComponent(
        vkScript,
      )}&access_token=${vk_token}&v=5.91`;

      const data: CommentsResponse  = await fetch(url).then((d) => d.json());
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new VkGrpInfo(3000);
