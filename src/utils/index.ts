import Db from 'db/Db';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { appendFileSync, existsSync } from 'fs';
import path from 'path';
import { ItemPost } from 'types';

class Utils {
  static async createTmpDir() {
    const filePath = path.join(process.cwd(), '/temp_data');
    const exists = existsSync(filePath);
    if (!exists) {mkdirSync(filePath);
    await  Db.initTables();
    }
  }


  static writeOffset(page: number | string) {
    this.createTmpDir();
    const filePath = path.join(process.cwd(), '/temp_data/offset');
    writeFileSync(filePath, String(page));
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

  static writeCommentsStatus(status:string) {
    const filePath = path.join(process.cwd(), '/temp_data/comments.txt');
    writeFileSync(filePath, status);
  }

  static readCommentsStatus() {
    const filePath = path.join(process.cwd(), '/temp_data/comments.txt');
    const exists = existsSync(filePath);
    if (!exists) return 'no comments';
   return  readFileSync(filePath).toString();

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
