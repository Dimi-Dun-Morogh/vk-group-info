import config from 'config';
import {
  CommentsResponse,
  ItemPost,
  PostGetById,
  ResponseWall,
  ResponseWallExec,
  Thread,
  ThreadResponse,
  UserResponse,
  VkErr,
} from 'types';
import Utils from 'utils';

const { vk_grp_id, vk_token } = config;

class VkGrpInfo {
  /**
   *
   * @param startDate date string format  YYYY-MM-DDTHH:mm '2023-05-31T00:00'
   * @param endDate date string format  YYYY-MM-DDTHH:mm '2023-05-31T23:59'
   * @returns
   */
  async getWPosts(startDate:string, endDate:string) {
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

      const reachedDate = data.response.some((p) => this.endGetWPosts(p, startDate));

      data.response.forEach((p) => {
        const toDrop = this.dateReached(p, startDate, endDate);
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
      this.getWPosts(startDate, endDate);
    } catch (error) {
      console.error(error);
    }
  }

  private endGetWPosts(post:ItemPost,startDay:string) {
    const firstDay = new Date(startDay)
    const pinned = post.is_pinned;
    const postDate = Number(post.date + '000');
    return Number(firstDay) > postDate && !pinned;
  }

  private dateReached(post: ItemPost, startDay:string, endDay:string) {
    // YYYY-MM-DDTHH:mm '2023-05-31T23:59' GMT-0500
    const lastDay = new  Date(endDay);
    const firstDay = new Date(startDay)
    const postDate = Number(post.date + '000');

    return Number(lastDay) < postDate  ||   Number(firstDay) > postDate;
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
//     console.log(`${firstDate} -  ${lastDate}  -  даты записанных постов
// всего постов - ${posts.length - 1}`);
   return `[${firstDate} -  ${lastDate}] [всего постов - ${posts.length - 1}]`
  }

  async printTop10posts(filter: 'likes' | 'comments') {
    try {
      const data = await this.top10Posts(filter);
      if (!data) return;

      const format = data.map((el) => {

        return filter === 'comments'
          ? {
              Комментариев: el.comments,
              Лайков: el.likes,
              'Автор поста': el.author_name,
              'Дата поста': new Date(
                Number(el.date + '000'),
              ).toLocaleDateString('Ru-ru'),
              ссылка: el.link,
            }
          : {
              Лайков: el.likes,
              Комментариев: el.comments,
              'Автор поста': el.author_name,
              'Дата поста': new Date(
                Number(el.date + '000'),
              ).toLocaleDateString('Ru-ru'),
              ссылка: el.link,
            };
      }).reduce((acc,el,index)=>{
        acc[index+1] = el;
        return acc;
      },{} as {[key:number]:{[key:string]:string}})
      console.log(`                    ТОП 20 ПОСТОВ ПО ${filter === 'comments' ? 'КОММЕНТАМ' : 'ЛАЙКАМ'} ${this.postDates()}`)
      console.table(format);
    } catch (error) {
      console.error(error);
    }
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
        .slice(0, 20);

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

      const res = {} as { [key: number]: number };

      for (const postId of postIds) {
        console.timeLog('countComments', postId);
        const data = await this.vkScriptComments(+postId, 0);

        if (!data || 'error' in data) continue;

        // console.log(data)
        const count = data.response.count;

        for (let i = 0; i < count + 100; i += 100) {
          let loopData;
          if (i === 0) loopData = data;
          else {
            loopData = await this.vkScriptComments(+postId, i);
            await Utils.waiter(1000);
          }

          if (!loopData || loopData.response.items.length === 0) break;
          const { items } = loopData.response;

          // loop thru items to fill in ress object and to find thread objects
          for (let j = 0; j < items.length; j++) {
            const { from_id, thread, id } = items[j];
            res[from_id] = res[from_id] ? res[from_id] + 1 : 1;
            //hande comment thread
            if (thread.count > 0) {
              const threadComments = await this.commentThread(thread, id);
              Object.entries(threadComments!).forEach(([f_id, num]) => {
                const key = Number(f_id);
                res[key] = res[key] ? res[key] + num : num;
              });
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

  private async commentThread(thread: Thread, commentId: number) {
    try {
      const res = {} as { [key: number]: number };
      const { items, count } = thread;
      if (count <= 10) {
        items.forEach(
          (el) => (res[el.from_id] = res[el.from_id] ? res[el.from_id] + 1 : 1),
        );
        return res;
      }

      // create loop based on count and iterate to fetch all comments with OFFset in vk script
      for (let i = 0; i < count + 100; i += 100) {
        const data = await this.vkScriptThreads(3295343, commentId, i);
        data?.response.items.forEach(
          (el) => (res[el.from_id] = res[el.from_id] ? res[el.from_id] + 1 : 1),
        );
        await Utils.waiter(2000);
      }
      return res;
    } catch (error) {
      console.error(error);
    }
  }

  private async vkScriptThreads(
    postId: number,
    commentId: number,
    offset: number,
  ) {
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
      console.error(error);
    }
  }

  private async vkScriptComments(postId: number, offset: number) {
    try {
      const vkScript = `var grpId = ${config.vk_grp_id};
      var postId = ${postId};
      var rootData = API.wall.getComments({owner_id:grpId, post_id: postId, offset: ${offset}, thread_items_count: 10, count: 100});
      var commentsCount = rootData.response.count;


      return rootData;`;

      const url = `https://api.vk.com/method/execute?&code=${encodeURIComponent(
        vkScript,
      )}&access_token=${vk_token}&v=5.91`;

      const data: CommentsResponse = await fetch(url).then((d) => d.json());
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async printTopComentator() {
    const data: { [key: string]: number } = JSON.parse(
      Utils.readCommentsJson(),
    );

    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0,20)
    const idsToFetch = sorted.reduce((acc,item)=>acc+=`${item[0]},`,'');

    const url  = `https://api.vk.com/method/users.get?&user_ids=${encodeURIComponent(
      idsToFetch,
    )}&access_token=${vk_token}&v=5.131`
    const usersGet: UserResponse  = await fetch(url).then(d=>d.json());
    const serialize = sorted.map(el=>{
      const [id, score] = el;
      const user = usersGet.response.find(usr=> usr.id == +id);
      return {
        Комментатор: `${user?.first_name} ${user?.last_name}`,
        Комментариев:  score
      }
    }).reduce((acc,el,index)=>{
      acc[index+1] = el;
      return acc;
    },{} as {[key:number]:{[key:string]:string|number}})

    console.log(`  ТОП 20 ПОЛЬЗОВАТЕЛЕЙ ПО КОММЕНТАРИЯМ' ${this.postDates()}`)
    console.table(serialize);
  }
}

export default new VkGrpInfo();
