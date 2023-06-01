import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { appendFileSync, existsSync } from 'fs';
import path from 'path';
import { ItemPost } from 'types';

class Utils {
  static createTmpDir() {
    const filePath = path.join(process.cwd(), '/temp_data');
    const exists = existsSync(filePath);
    if (!exists) mkdirSync(filePath);
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

  static readPostsCSV() {
    const file = readFileSync(
      path.join(process.cwd(), '/temp_data/postsInCsv.csv'),
      { encoding: 'utf-8' },
    );
    return file.split('\n');
  }

  static writeOffset(page: number | string) {
    this.createTmpDir();
    const filePath = path.join(process.cwd(), '/temp_data/offset');
    writeFileSync(filePath, String(page));
  }

  static getOffset() {
    this.createTmpDir();
    const filePath = path.join(process.cwd(), '/temp_data/offset');
    const exists = existsSync(filePath);
    if (!exists) return '0';
    const file = readFileSync(filePath);
    return file.toString();
  }

  static waiter(time = 10000) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  static writeCommentsJson(commentsObj: any) {
    const filePath = path.join(process.cwd(), '/temp_data/comments.json');
    writeFileSync(filePath, JSON.stringify(commentsObj));
  }

  static readCommentsJson() {
    const filePath = path.join(process.cwd(), '/temp_data/comments.json');
    const data = readFileSync(filePath, { encoding: 'utf8' });
    return data;
  }

  static wipeTemp () {
    const filePath = path.join(process.cwd(), '/temp_data');
    const exists = existsSync(filePath);
    if(exists) rmSync(filePath, {force:true, recursive: true});
  }

}

export default Utils;
