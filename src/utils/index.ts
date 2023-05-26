import { mkdirSync } from 'fs';
import { appendFileSync, existsSync } from 'fs';
import path from 'path';
import { ItemPost } from 'types';

class Utils {
  static createTmpDir() {
    const filePath = path.join(process.cwd(), '/temp_data')
    const exists = existsSync(filePath);
    if(!exists) mkdirSync(filePath);
  }

  static writeCSV(post: ItemPost) {
    try {
      const { from_id, likes, date, comments, id } = post;
      const csv = `${id},${from_id},${date},${likes.count},${comments.count}\n`;
      const filePath = path.join(process.cwd(), '/temp_data/postsInCsv.csv');
      this.createTmpDir();
      appendFileSync(filePath, csv);
    } catch (error) {
      console.error(error);
    }
  }

}

export default Utils;
