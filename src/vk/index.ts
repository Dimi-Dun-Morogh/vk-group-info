import config from 'config';
import Db from 'db/Db';
import {
  CommentsResponse,
  GrpInfoResponse,
  ItemPost,
  PostGetById,
  ResponseWallExec,
  Thread,
  ThreadResponse,
  User,
  UserResponse,
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
  async getWPosts(startDate: string, endDate: string) {
    try {
      const offset = Number(await Utils.getOffset());
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

      const reachedDate = data.response.some((p) =>
        this.endGetWPosts(p, startDate),
      );

      data.response.forEach((p) => {
        const toDrop = this.dateReached(p, startDate, endDate);
        if (toDrop) return;
        //   if(reachedDate) return;

        Db.writePost(p);
      });

      //! здесь прочекать на то что дата последнего поста не меньше первого числа 00 ночи этого месяца

      if (reachedDate) {
        console.timeEnd('getWPosts');
        await this.postDates();
        Utils.writeOffset('DONE');
        return;
      }
      Utils.writeOffset(nextOffset);
      await Utils.waiter(1000);
      this.getWPosts(startDate, endDate);
    } catch (error) {
      console.error(error);
    }
  }

  private endGetWPosts(post: ItemPost, startDay: string) {
    const firstDay = new Date(startDay);
    const pinned = post.is_pinned;
    const postDate = Number(post.date + '000');
    return Number(firstDay) > postDate && !pinned;
  }

  private dateReached(post: ItemPost, startDay: string, endDay: string) {
    // YYYY-MM-DDTHH:mm '2023-05-31T23:59' GMT-0500
    const lastDay = new Date(endDay);
    const firstDay = new Date(startDay);
    const postDate = Number(post.date + '000');

    return Number(lastDay) < postDate || Number(firstDay) > postDate;
  }

  async postDates() {
    const done = (await Utils.getOffset()) === 'DONE';
    if (!done) return '';
    const data =
      (await Db.all(`SELECT MIN(date) AS earliest_date , MAX(date) as latest_date , COUNT(*) as post_count
    FROM posts;`)) as {
        earliest_date: number;
        latest_date: number;
        post_count: number;
      }[];

    const lastDate = new Date(Number(data[0].earliest_date)).toLocaleString(
      'Ru-ru',
    );
    const firstDate = new Date(Number(data[0].latest_date)).toLocaleString(
      'Ru-ru',
    );
    return `[${lastDate} -  ${firstDate}][всего постов - ${data[0].post_count}]`;
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
              'Дата поста': new Date(Number(el.date)).toLocaleDateString(
                'Ru-ru',
              ),
              ссылка: el.link,
              avatar: el.avatar,
            }
          : {
              Лайков: el.likes,
              Комментариев: el.comments,
              'Автор поста': el.author_name,
              'Дата поста': new Date(Number(el.date)).toLocaleDateString(
                'Ru-ru',
              ),
              ссылка: el.link,
              avatar: el.avatar,
            };
      });

      console.log(`                     ТОП 20 ПОСТОВ ПО ${
        filter === 'comments' ? 'КОММЕНТАМ' : 'ЛАЙКАМ'
      }
         ${await this.postDates()}`);
      console.table(
        format.reduce((acc, el, index) => {
          const consoleEl = { ...el };
          delete consoleEl.avatar;
          acc[index + 1] = consoleEl;

          return acc;
        }, {} as { [key: number]: { [key: string]: string | undefined | number } }),
      );
      return {
        dates: await this.postDates(),
        data: format,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async top10Posts(filter: 'likes' | 'comments') {
    try {
      const posts = await Db.fetchTopPosts(filter);

      //! тут полчить инфо о посте чтоб вписать нейм юзера и ссылку на пост
      const postIds = posts.reduce(
        (acc, item) => (acc += `${config.vk_grp_id}_${item.id},`),
        '',
      );
      const url = `https://api.vk.com/method/wall.getById?v=5.131&access_token=${
        config.vk_token
      }&posts=${postIds.slice(0, postIds.length - 1)}&extended=1`;
      const data: PostGetById = await fetch(url).then((d) => d.json());
      const res = posts.map((item) => {
        const author = data.response.profiles.find(
          (el) => el.id === +item.author_id,
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

  async topPostersByChar() {
    const data = await Db.fetchPostersByChars();
    const idsToFetch = data.reduce(
      (acc, el) => (acc += `${el.author_id},`),
      '',
    );
    const url = `https://api.vk.com/method/users.get?&fields=photo_100&user_ids=${encodeURIComponent(
      idsToFetch,
    )}&access_token=${vk_token}&v=5.131`;
    const usersGet: UserResponse = await fetch(url).then((d) => d.json());
    const serialized = data.map((el) => {
      const author = usersGet.response.find((au) => au.id == +el.author_id);
      return {
        СИМВОЛОВ: el.total_chars,
        ПОСТОВ: el.posts_count,
        'имя автора': `${author?.first_name} ${author?.last_name}`,
        avatar: author?.photo_100,
      };
    });

    console.log(`     ТОП 20 ПОСТЕРОВ ПО КОЛИЧЕСТВУ СИМВОЛОВ В ПОСТАХ'
    ${await this.postDates()}`);
    const formatted = serialized.reduce((acc, el, index) => {
      const consoleEl = { ...el };
      delete consoleEl.avatar;
      acc[index + 1] = consoleEl;
      return acc;
    }, {} as { [key: number]: { [key: string]: string | number | undefined } });
    console.table(formatted);

    return {
      dates: await this.postDates(),
      data: serialized,
    };
  }

  async topCommentatorsByChar() {
    const data = await Db.fetchCommentatorsByChars();
    const idsToFetch = data.reduce((acc, el) => (acc += `${el.from_id},`), '');
    const url = `https://api.vk.com/method/users.get?&fields=photo_100&user_ids=${encodeURIComponent(
      idsToFetch,
    )}&access_token=${vk_token}&v=5.131`;
    const usersGet: UserResponse = await fetch(url).then((d) => d.json());
    const serialized = data.map((el) => {
      const author = usersGet.response.find((au) => au.id == +el.from_id);
      return {
        СИМВОЛОВ: el.total_chars,
        КОМЕНТАРИЕВ: el.comments_count,
        'имя автора': `${author?.first_name} ${author?.last_name}`,
        avatar: author?.photo_100,
      };
    });

    console.log(`     ТОП 20 КОММЕНАТОРОВ ПО КОЛИЧЕСТВУ СИМВОЛОВ В КОМЕНТАРИЯХ'
    ${await this.postDates()}`);
    const formatted = serialized.reduce((acc, el, index) => {
      const consoleEl = { ...el };
      delete consoleEl.avatar;
      acc[index + 1] = consoleEl;
      return acc;
    }, {} as { [key: number]: { [key: string]: string | number | undefined } });
    console.table(formatted);

    return {
      dates: await this.postDates(),
      data: serialized,
    };
  }

  async countComments() {
    try {
      console.time('countComments');
      const postIds = (await Db.all('SELECT id FROM posts')) as {
        id: number;
      }[];

      const res = {} as { [key: number]: number };

      for (const [index, postId] of postIds.entries()) {
        //?will write index to file here for progress bar purposes
        Utils.writeCommentProgress(index + 1);

        console.timeLog('countComments', postId);
        const data = await this.vkScriptComments(postId.id, 0);

        if (!data || 'error' in data) continue;

        // console.log(data)
        const count = data.response.count;
        if (count == 0) await Utils.waiter(500);

        for (let i = 0; i < count + 100; i += 100) {
          let loopData;
          if (i === 0) loopData = data;
          else {
            loopData = await this.vkScriptComments(postId.id, i);
            await Utils.waiter(700);
          }

          if (!loopData || loopData.response.items.length === 0) break;
          const { items } = loopData.response;

          // loop thru items to fill in ress object and to find thread objects
          for (let j = 0; j < items.length; j++) {
            const { from_id, thread, id } = items[j];
            res[from_id] = res[from_id] ? res[from_id] + 1 : 1;

            //!write to db;
            await Db.writeComment(items[j]);
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
        await Utils.getCommentsProgress();
      }
      Utils.writeCommentsStatus('ok');
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
        items.forEach((el) => {
          res[el.from_id] = res[el.from_id] ? res[el.from_id] + 1 : 1;
          //!
          Db.writeComment(el);
        });
        return res;
      }

      // create loop based on count and iterate to fetch all comments with OFFset in vk script
      for (let i = 0; i < count + 100; i += 100) {
        const data = await this.vkScriptThreads(3295343, commentId, i);
        data?.response.items.forEach((el) => {
          res[el.from_id] = res[el.from_id] ? res[el.from_id] + 1 : 1;
          //!
          Db.writeComment(el);
        });
        await Utils.waiter(500);
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
      var rootData = API.wall.getComments({owner_id:grpId, need_likes:true, post_id: postId, offset: ${offset}, thread_items_count: 10, count: 100, comment_id: ${commentId}});
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
      var rootData = API.wall.getComments({owner_id:grpId, need_likes:true, post_id: postId, offset: ${offset}, thread_items_count: 10, count: 100});
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

  async printTopPosters() {
    try {
      const data = await Db.fetchTopPosters();
      const idsToFetch = data.reduce(
        (acc, el) => (acc += `${el.author_id},`),
        '',
      );
      const url = `https://api.vk.com/method/users.get?&fields=photo_100&user_ids=${encodeURIComponent(
        idsToFetch,
      )}&access_token=${vk_token}&v=5.131`;
      const usersGet: UserResponse = await fetch(url).then((d) => d.json());
      const serialized = data.map((el) => {
        const author = usersGet.response.find((au) => au.id == +el.author_id);
        return {
          ПОСТОВ: el.post_count,
          'имя автора': `${author?.first_name} ${author?.last_name}`,
          КОМЕНТОВ: el.total_comments,
          ЛАЙКОВ: el.total_likes,
          avatar: author?.photo_100,
        };
      });

      console.log(`     ТОП 20 ПОЛЬЗОВАТЕЛЕЙ ПО НАПИСАННЫМ ПОСТАМ | КОММЕНТЫ И ЛАЙКИ НА ПОСТАХ АВТОРА'
      ${await this.postDates()}`);
      const formatted = serialized.reduce((acc, el, index) => {
        const consoleEl = { ...el };
        delete consoleEl.avatar;
        acc[index + 1] = consoleEl;
        return acc;
      }, {} as { [key: number]: { [key: string]: string | number | undefined } });
      console.table(formatted);

      return {
        dates: await this.postDates(),
        data: serialized,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async printTopComentator(filter: 'comments_count' | 'total_likes') {
    console.log('hi');
    const data = await Db.fetchTopCommentators(filter);
    const idsToFetch = data.reduce(
      (acc, item) => (acc += `${item.from_id},`),
      '',
    );
    console.log(data, filter);
    const url = `https://api.vk.com/method/users.get?&user_ids=${encodeURIComponent(
      idsToFetch,
    )}&fields=photo_100&access_token=${vk_token}&v=5.131`;
    const usersGet: UserResponse = await fetch(url).then((d) => d.json());
    const serialize = data
      .map((el) => {
        const { from_id, comments_count, total_likes } = el;
        const user = usersGet.response.find((usr) => usr.id == from_id);
        return {
          Комментатор: `${user?.first_name} ${user?.last_name}`,
          Комментариев: comments_count,
          Лайков: total_likes,
        };
      })
      .reduce((acc, el, index) => {
        acc[index + 1] = el;
        return acc;
      }, {} as { [key: number]: { [key: string]: string | number } });

    console.log(`     ТОП 20 ПОЛЬЗОВАТЕЛЕЙ ПО КОММЕНТАРИЯМ'
${await this.postDates()}`);
    console.table(serialize);

    const serializeForWeb = data.map((el) => {
      const { from_id: id, comments_count: score, total_likes } = el;
      const user = usersGet.response.find((usr) => usr.id == +id);
      return {
        Комментатор: `${user?.first_name} ${user?.last_name}`,
        Комментариев: score,
        avatar: user?.photo_100,
        Лайков: total_likes,
      };
    });

    return {
      dates: await this.postDates(),
      data: serializeForWeb,
    };
  }

  async grpInfo() {
    try {
      const url = `https://api.vk.com/method/groups.getById?group_id=${vk_grp_id?.slice(
        1,
      )}&access_token=${vk_token}&v=5.131`;
      const data: GrpInfoResponse = await fetch(url).then((d) => d.json());
      console.log(data);
      return data.response[0];
    } catch (error) {
      console.error(error);
    }
  }

  async allTop1s() {
    const topLikedPost = await Db.top1likedPost();
    const topLikedComment = await Db.top1likedComment();
    const topPostByChar = await Db.top1PostByCHar();
    const topCommentByChar = await Db.top1CommentByCHar();
    const profilesTofetch = `${topLikedPost.author_id},${topLikedComment.from_id},${topPostByChar.author_id},${topCommentByChar.from_id}`;
    const profiles = await this.profileData(profilesTofetch);

    return {
      post_by_likes: topLikedPost,
      comment_by_likes: topLikedComment,
      post_by_char: topPostByChar,
      comment_by_char: topCommentByChar,
      profiles,
    };
  }

  private async profileData(ids: string) {
    const url = `https://api.vk.com/method/users.get?&fields=photo_100&user_ids=${encodeURIComponent(
      ids,
    )}&access_token=${vk_token}&v=5.131`;
    const usersGet: UserResponse = await fetch(url).then((d) => d.json());
    return usersGet.response.reduce((acc, el) => {
      acc[el.id] = el;
      return acc;
    }, {} as { [key: number]: User });
  }

  async wrapCountLikers(){
    Utils.writeLikesStatus('START');
    await this.countLikers('post');
    await  this.countLikers('comment');
    Utils.writeLikesStatus('OK');
  }

  async countLikers(mode: 'post' | 'comment') {
    console.time('countLikers');

    let allIds = [];
    if (mode === 'post') {
      allIds = await Db.allPostIds();
    } else {
      allIds = await Db.allCommentIds();
    }

    for (let i = 0; i < allIds.length; i += 20) {
      const Ids = [];

      for (let j = i; j < i + 20; j++) {
        if (allIds[j]) Ids.push(allIds[j].id);
      }

      const data = await this.vkScriptLikes(Ids, mode);
      console.log(data);
      //TODO TOKEN SWAP ON ERROR 29
      const dataFlatten = data.response.flat();
      await Utils.waiter(700);

      console.timeLog('countLikers');

      Utils.writeLikesProgress(
        `${i}|${allIds.length}|${((i / allIds.length) * 100).toFixed(
          2,
        )}|${mode}`,
      );
      Utils.getLikesProgress();
      for (const dataLike of dataFlatten) {
        await Db.writeLike(dataLike, mode);
      }
    }
    console.timeEnd('countLikers');

  }

  private async vkScriptLikes(iDs: number[], type: 'post' | 'comment') {
    const vkScript = `
    var res = [];
    var Ids =  ${JSON.stringify(iDs)};

    var grpId = ${config.vk_grp_id};
    var likeType ="${type}";

    while(Ids.length){
        var itemId = Ids.shift();
        var rootData = API.likes.getList({owner_id:grpId, item_id:itemId,
        count: 300, type: likeType});
        res.push(rootData.items);
    }



    return res;`;

    const url = `https://api.vk.com/method/execute?&code=${encodeURIComponent(
      vkScript,
    )}&access_token=${vk_token}&v=5.154`;

    const data = await fetch(url).then((d) => d.json());
    return data as {
      response: Array<Array<number>>;
    };
  }

  async likers() {
    const byPosts = await Db.likers('post');
    const byComments = await Db.likers('comment');

    const allProfileIds =
      byPosts.reduce((acc, el) => (acc += `${el.from_id},`), '') +
      byComments.reduce((acc, el) => (acc += `${el.from_id},`), '');

    const profileData = await this.profileData(allProfileIds);

    const serialize = (data: { from_id: number; total: number }[]) => {
      return data.reduce((acc, el) => {
        const profile = profileData[el.from_id];
        acc.push({ ...el, user: profile });
        return acc;
      }, [] as { from_id: number; total: number; user: User }[]);
    };

    return { by_posts: serialize(byPosts), by_comments: serialize(byComments) };
  }
}

export default new VkGrpInfo();
