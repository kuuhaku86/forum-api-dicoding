const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const Comment = require('../../Domains/comments/entities/Comment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { credentials, content, threadId } = addComment;

    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comments (id, owner, thread_id, content) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, credentials, threadId, content],
    };

    let result = undefined;

    try {
      result = await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }

    return new AddedComment({ ...result.rows[0] });
  }

  async getOwner(commentId) {
    const query = {
      text: `SELECT owner 
            FROM comments
            WHERE id = $1
            `,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return result.rows[0].owner;
  }

  async getComment({ threadId, commentId }) {
    const query = {
      text: `SELECT comments.id,
                    comments.date,
                    comments.is_deleted,
                    comments.content,
                    users.username,
                    COUNT(likes.*) AS like_count
            FROM comments
            JOIN users ON comments.owner = users.id
            LEFT JOIN likes ON comments.id = likes.comment_id
            WHERE comments.id = $1
            AND comments.thread_id = $2
            GROUP BY comments.id, comments.date, comments.is_deleted, comments.content, users.username
            `,
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    const date = (new Date(result.rows[0].date)).toISOString();

    return new Comment({
      ...result.rows[0],
      date,
    });
  }

  async softDelete(id) {
    const query = {
      text: `UPDATE comments 
            SET is_deleted=true
            WHERE id = $1
            `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async getComments(threadId) {
    const query = {
      text: `SELECT comments.id,
                    comments.date,
                    comments.is_deleted,
                    comments.content,
                    users.username,
                    COUNT(likes.*) AS like_count
            FROM comments
            JOIN users ON comments.owner = users.id
            LEFT JOIN likes ON comments.id = likes.comment_id
            WHERE comments.thread_id = $1
            GROUP BY comments.id, comments.date, comments.is_deleted, comments.content, users.username
            ORDER BY comments.date ASC
            `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    let comments = [];

    for (let i = 0; i < result.rows.length; i++) {
      const comment = result.rows[i];
      const date = (new Date(comment.date)).toISOString();

      comments.push(new Comment({
        ...comment,
        date,
      }));
    }

    return comments;
  }
}

module.exports = CommentRepositoryPostgres;