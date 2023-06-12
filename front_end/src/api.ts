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
}

export default new Api();
