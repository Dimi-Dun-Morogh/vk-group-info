import { createInterface } from "readline/promises";
import Utils from "utils";
import VkGrpInfo from "vk";

export default ()=> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const helpMsg =`Добро пожаловать в vk-group-info
  Комманды:
  getwposts YYYY-MM-DDTHH:MM YYYY-MM-DDTHH:MM  -  начальная и конечная дата постов, пример
  getwposts 2023-05-01T00:00 2023-05-31T23:59
  ----------------------------------------------------------------------------------------
  countcomments - запустит фетч комментов для ID постов спарсенных коммандой  getwposts
  ----------------------------------------------------------------------------------------
  topcomment - выведет в консоль топ 20 комментаторов
  ----------------------------------------------------------------------------------------
  topposts |filter|  - выведет в консоль топ 20 постов, фильтр  likes||comments
  пример topposts likes
  ----------------------------------------------------------------------------------------
  topposters - выведет в консоль топ 20 постеров по количеству постов
  ----------------------------------------------------------------------------------------
  help - показать это сообщение снова
  `

  console.log(helpMsg)
  rl.on('line', async (line) => {
    switch (line.split(' ')[0]) {
      case 'topposters':
          await VkGrpInfo.printTopPosters();
        break;
      case 'topposts': {
        const filter = line.split(' ')[1];
       if(filter == 'likes' || filter == 'comments') {
        await VkGrpInfo.printTop10posts(filter)
       }

        break;
      }
      case 'topcomment':
        await VkGrpInfo.printTopComentator('comments_count');
      break;
      case 'countcomments':
        await VkGrpInfo.countComments()
      break;
      case 'getwposts':
        Utils.wipeTemp();
        const [, date1, date2] = line.split(' ');
        console.log(`getting posts for dates ${new Date(date1.trim()).toLocaleDateString()} - ${new Date(date2.trim()).toLocaleDateString()}`)
        await VkGrpInfo.getWPosts(date1, date2)
      break;
      default:
        console.log(helpMsg)
        break;
    }
  });

}


