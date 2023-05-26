import config from 'config';
import { ResponseWall } from 'types';
import Utils from 'utils';

const {vk_grp_id, vk_token} = config;

class VkGrpInfo {
  static async getWPosts() {
    try {
      const url = `https://api.vk.com/method/wall.get?&owner_id=${vk_grp_id}&count=3&access_token=${vk_token}&v=5.131`;
      const data: ResponseWall = await fetch(url).then(r=>r.json());
      console.log(data, vk_grp_id, url);
      Utils.writeCSV(data.response.items[0]);
    } catch (error) {
      console.error(error);
    }
  }
}

export default VkGrpInfo;
