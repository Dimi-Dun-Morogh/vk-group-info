class Api {
  url = 'http://192.168.0.191:3000';

  async fetchPosts(date: string) {
    try {
      const [start, end] = date.split(' ');
      const url = `${this.url}/wallposts?start=${start}&end=${end}&`;
      await fetch(url);
    } catch (error) {
      console.error(error);
    }
  }

  async offsetStatus() {
    try {
      const data = await fetch(this.url + '/offset');
      return await data.text();
    } catch (error) {
      console.error(error);
    }
  }

  async dataStatus() {
    try {
      const data = await fetch(this.url + '/datastatus');
      return await data.json();
    } catch (error) {
      console.error(error);
    }
  }

  async envStatus() {
    try {
      const data = await fetch(this.url + '/envstatus').then((d) => d.json());
      return data as {
        vk_token: string | undefined;
        vk_grp_id: string | undefined;
      };
    } catch (error) {
      console.error(error);
    }
  }

  async topCommentator(filter: string) {
    try {
      //'comments_count' || 'total_likes'
      const data = await fetch(this.url + '/topcomment?filter=' + filter).then(
        (d) => {
          console.log(d);
          return d.json();
        },
      );
      return data as
        | {
            dates: string;
            data: [
              {
                Комментатор: string;
                Комментариев: number;
                Лайков: number;
                avatar: string;
              },
            ];
          }
        | {
            err: 'no comments';
            progress: {
              percent: number;
              totalPostsNum: number;
              current: number;
            };
          };
    } catch (error) {
      console.error(error);
    }
  }

  async byChars(filter: string) {
    try {
      //'comments_count' || 'total_likes'
      const data = await fetch(this.url + '/bychars?filter=' + filter).then(
        (d) => {
          console.log(d);
          return d.json();
        },
      );
      console.log(data)
      return data as
        | {
            dates: string;
            data: [
              {
                'имя автора': string;
                КОМЕНТАРИЕВ: number;
                ПОСТОВ: number;
                avatar: string;
                СИМВОЛОВ: number;
              },
            ];
          }
        | {
            err: 'no comments';
            progress: {
              percent: number;
              totalPostsNum: number;
              current: number;
            };
          };
    } catch (error) {
      console.error(error);
    }
  }

  async countComments() {
    try {
      await fetch(this.url + '/countcomments');
    } catch (error) {
      console.error(error);
    }
  }

  async topPosts() {
    try {
      const dataLikes: PostStatResp = await fetch(
        this.url + '/topposts?filter=likes',
      ).then((d) => d.json());
      const dataComments: PostStatResp = await fetch(
        this.url + '/topposts?filter=comments',
      ).then((d) => d.json());
      return {
        likes: dataLikes,
        comments: dataComments,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async topPosters() {
    try {
      const data: respTopPosters = await fetch(this.url + '/topposters').then(
        (d) => d.json(),
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async allTops1s() {
    try {
      const data = await fetch(this.url + '/alltop1').then(d=>d.json());
      return data as  {
        post_by_likes: Post,
        comment_by_likes: Comment,
        post_by_char: Post,
        comment_by_char: Comment,
        profiles: {[key:number]: vkProfile}
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getLikers() {
    try {
      const data = await fetch(this.url +'/likers').then(d=>d.json());
      return data as {
        status:'no likes'
      } | {
        currInd: string;
        arrLen: string;
        percentile: string;
        mode: string;
      } | {  by_posts: {
        from_id: number;
        total: number;
        user: vkProfile;
    }[];
    by_comments: {
        from_id: number;
        total: number;
        user: vkProfile;
    }[];}
    } catch (error) {
      console.error(error)
    }
  }

  async waiter(ms:number) {
    return new Promise((resolve)=>{
      setTimeout(resolve, ms)
    })
  }
}

export interface PostStatResp {
  dates: string;
  data: PostStat[];
}

export interface Comment {
  text: string;
  id: number;
  from_id:number;
  post_id:number;
  date:number;
  likes:number;
  comment_length:number;
}

export interface Post {   text: string;
  id: number;
  likes: number;
  author_id: number;
  date: number;
  comments: number;
  post_length:number;
}

export interface vkProfile {
  id: number
  first_name: string
  last_name: string
  can_access_closed: boolean
  photo_100:string
  is_closed: boolean
}


export interface PostStat {
  Лайков: string;
  Комментариев: string;
  'Автор поста': string;
  'Дата поста': string;
  ссылка: string;
  avatar: string;
}

export interface respTopPosters {
  dates: string;
  data: topPosters[];
}

export interface topPosters {
  ПОСТОВ: number;
  'имя автора': string;
  КОМЕНТОВ: number;
  ЛАЙКОВ: number;
  avatar: string;
}

export interface ComentatorsResp {
  dates: string;
  data: [
    {
      Комментатор: string;
      Комментариев: number;
      Лайков: number;
      avatar: string;
    },
  ];
}

export default new Api();
