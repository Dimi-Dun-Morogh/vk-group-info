import { readFileSync } from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { CommentsItem, ItemPost } from 'types';

class Db {
  db() {
    const pathDb = path.join(process.cwd(), '/temp_data/database.db');
    const db = new sqlite3.Database(pathDb, (err) => {
      if (err) {
        console.log(
          path.join(process.cwd(), '/temp_data/database.db'),
          'path is',
        );
        throw new Error(err.message + `@${pathDb}`);
      } else {
        console.log('connected to db' + `@${pathDb}`);
      }
    });
    db.configure("busyTimeout", 30000)
    return db;
  }

  run(query: string, params: any=null): Promise<true | null> {
    return new Promise((resolve, reject) => {
      const db = this.db();
      const res = db.run(query, params, (err) => {
        if (err) {
          reject(err);
        } else {

          resolve(true);
        }
      });
      console.log('closer')
      db.close((error) => {
        if (error) console.error('error closing db', error);
        else console.log('db closing ok');
      });
    });
  }


  exec(query: string): Promise<true | null> {
    return new Promise((resolve, reject) => {
      const db = this.db();
      const res = db.exec(query, (err) => {
        if (err) {
          reject(err);
        } else {
          db.close();
          resolve(true);
        }
      });
    });
  }

  all(query: string): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      const db = this.db();
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          db.close();
          resolve(rows);
        }
      });
    });
  }

  async initTables() {
    const filePath = path.join(__dirname, 'init_tables.sql');
    const query = readFileSync(filePath).toString();

    const res = await this.exec(query).catch((err) => console.error(err));
    if (res) {
      console.log('initTables ok');
    }
  }

  async writePost(post: ItemPost) {
    const { id, comments, likes, text, from_id, date } = post;
    const query =
      'INSERT into posts (id, comments, likes, author_id, text, date) VALUES(?,?,?,?,?,?)';

    await this.run(query, [
      id,
      comments.count,
      likes.count,
      from_id,
      text,
      date * 1000,
    ]).then((res) => {
      console.log(`writing post ${post.id} ${res}`);
    });
  }

  async writeComment(comment: CommentsItem) {
    const { id, post_id, likes, text, from_id, date } = comment;
    // console.log(comment)
    const query =
      'INSERT into comments (id, from_id, post_id,  text, likes, date) VALUES(?,?,?,?,?,?)';

    await this.run(query, [
      id,
      from_id,
      post_id,
      text,
      likes?.count,
      date * 1000,
    ]).then((res) => {
      console.log(`writing comment ${comment.id} success`);
    });
  }

  readPosts() {
    const db = this.db();
    const query = 'SELECT * FROM posts';
    db.all(query, (e, rows) => {
      console.log(rows);
    });
    db.close();
  }

  async fetchTopPosts(filter: string) {
    const data = await this.all(`SELECT * FROM posts
ORDER BY ${filter} DESC
LIMIT 20;
`);
    return data as {
      text: string;
      id: number;
      likes: number;
      author_id: number;
      date: number;
      comments: number;
    }[];
  }

  async fetchTopPosters() {
    const data = await this.all(`
    SELECT author_id, COUNT(*) AS post_count,
    SUM(likes) AS total_likes,
    SUM(comments) AS total_comments
    FROM posts
    GROUP BY author_id
    ORDER BY post_count DESC
    LIMIT 20
    ;`);
    return data as {
      author_id: number;
      post_count: number;
      total_likes: number;
      total_comments: number;
    }[];
  }

  async fetchTopCommentators(filter: 'comments_count' | 'total_likes') {
    const data = await this.all(`
    SELECT from_id,
       COUNT(*) AS comments_count,
       SUM(likes) AS total_likes
       FROM comments
       GROUP BY from_id
       ORDER BY ${filter} DESC
       LIMIT 20
        ;`);
    return data as {
      from_id: number;
      comments_count: number;
      total_likes: number;
    }[];
  }
}

export default new Db();
