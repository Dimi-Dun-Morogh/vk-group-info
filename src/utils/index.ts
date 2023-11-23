import Db from 'db/Db';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { appendFileSync, existsSync } from 'fs';
import path from 'path';
import { ItemPost } from 'types';

class Utils {
  static async createTmpDir() {
    const filePath = path.join(process.cwd(), '/temp_data');
    const exists = existsSync(filePath);
    if (!exists) {
      mkdirSync(filePath);
      await Db.initTables();
    }
  }

  static writeOffset(page: number | string) {
    this.createTmpDir();
    const filePath = path.join(process.cwd(), '/temp_data/offset');
    writeFileSync(filePath, String(page));
  }

  static writeCommentProgress(postNum: number) {
    const filePath = path.join(process.cwd(), '/temp_data/comments_progress');
    writeFileSync(filePath, String(postNum));
  }

  /**
   *
   * @param progress 1 string currentIndex|ArrayLength|percentile|mode
   */
  static writeLikesProgress(progress: string) {
    const filePath = path.join(process.cwd(), '/temp_data/likes_progress');
    writeFileSync(filePath, String(progress));
  }

  static  getLikesProgress() {
    const filePath = path.join(process.cwd(), '/temp_data/likes_progress');
    const exists = existsSync(filePath);
    if (!exists) return;
    const data = readFileSync(filePath).toString();
    const [currInd, arrLen, percentile, mode] = data.split('|');
    console.log(`current index is ${currInd}, array length is ${arrLen} |
    ${percentile}% | mode - ${mode}`);

    return {currInd,  arrLen, percentile, mode}
  }

  static async getCommentsProgress() {
    const filePath = path.join(process.cwd(), '/temp_data/comments_progress');
    const exists = existsSync(filePath);
    if (!exists) return;
    const currIndex = readFileSync(filePath).toString();

    const totalPosts = (await Db.all(
      'SELECT count(id) as all_posts from posts',
    )) as Array<{ all_posts: number }>;
    const totalPostsNum = totalPosts[0]?.all_posts;
    const percent = ((Number(currIndex) / Number(totalPostsNum)) * 100).toFixed(
      2,
    );
    console.log(
      `${percent} %; ${currIndex} out of ${totalPostsNum}; commentsProgress`,
    );
    return {
      percent,
      current: currIndex,
      totalPostsNum,
    };
  }

  static async getOffset() {
    await this.createTmpDir();
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

  static writeCommentsStatus(status: string) {
    const filePath = path.join(process.cwd(), '/temp_data/comments.txt');
    writeFileSync(filePath, status);
  }

  static readCommentsStatus() {
    const filePath = path.join(process.cwd(), '/temp_data/comments.txt');
    const exists = existsSync(filePath);
    if (!exists) return 'no comments';
    return readFileSync(filePath).toString();
  }

  static writeLikesStatus(status: string) {
    const filePath = path.join(process.cwd(), '/temp_data/likes.txt');
    writeFileSync(filePath, status);
  }

  static readLikesStatus() {
    const filePath = path.join(process.cwd(), '/temp_data/likes.txt');
    const exists = existsSync(filePath);
    if (!exists) return 'no likes';
    return readFileSync(filePath).toString();
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
    if (exists) {
      rmSync(filePath, { force: true, recursive: true });
    }
  }
}

export default Utils;
