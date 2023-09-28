class Api {
  url = 'http://192.168.0.108:3000';

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

  async topCommentator(filter:string) {
    try {
      //'comments_count' || 'total_likes'
      const data = await fetch(this.url + '/topcomment?filter=' + filter).then((d) => {
      console.log(d)
        return   d.json()
      });
      return data as
        | {
            dates: string;
            data: [
              { Комментатор: string; Комментариев: number;Лайков: number; avatar: string },
            ];
          }
        | {err:'no comments'};
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
      const dataLikes:PostStatResp = await fetch(this.url + '/topposts?filter=likes').then(d=>d.json());
      const dataComments:PostStatResp = await fetch(this.url + '/topposts?filter=comments').then(d=>d.json());
      return {
        likes: dataLikes,
        comments: dataComments
      }
    } catch (error) {
      console.error(error)
    }
  }

  async topPosters() {
    try {
      const data:respTopPosters = await fetch(this.url + '/topposters').then(d=>d.json());
      return data
    } catch (error) {
      console.error(error)
    }
  }
}

export interface PostStatResp {
  dates: string
  data: PostStat[]
}

export interface PostStat {
  Лайков: string
  Комментариев: string
  "Автор поста": string
  "Дата поста": string
  ссылка: string
  avatar: string
}

export interface respTopPosters {
  dates: string
  data: topPosters[]
}

export interface topPosters {
  ПОСТОВ: number
  "имя автора": string
  КОМЕНТОВ: number
  ЛАЙКОВ: number
  avatar: string
}


export default new Api();
