class Api {
  url = 'http://localhost:3000';

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
}

export default new Api();
