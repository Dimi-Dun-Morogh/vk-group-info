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
    const filePath = path.join(process.cwd(), '/temp_data/postsInCsv.csv');
    const exists = existsSync(filePath);
    if (!exists) return [];
    const file = readFileSync(filePath, { encoding: 'utf-8' });
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
    const exists = existsSync(filePath);
    if (!exists) return 'no comments';
    const data = readFileSync(filePath, { encoding: 'utf8' });
    return data;
  }

  static wipeTemp() {
    const filePath = path.join(process.cwd(), '/temp_data');
    const exists = existsSync(filePath);
    if (exists) rmSync(filePath, { force: true, recursive: true });
  }

  static commentCsv(profileId: string | number, commentId: string | number) {
    const filePath = path.join(process.cwd(), '/temp_data/comment.csv');
    const csv = `\n${profileId},${commentId}`;
    appendFileSync(filePath, csv);
  }

  static readCommentsCsv() {
    const filePath = path.join(process.cwd(), '/temp_data/comment.csv');
    const file = readFileSync(filePath, { encoding: 'utf-8' });
    const arr = file.split('\n').slice(1);
    // const filtered = arr.filter(el=>{
    //   const [fId] = el.split(',');
    //   return fId ==  '805675061'
    // })
    // const res = {} as any;

    // filtered.forEach(el=>{
    //   const[fId, id] = el.split(',')
    //   res[id] = res[id] ? res[id] + 1 : 1
    // })
    // console.log(res)
    return arr
  }
}

export default Utils;
