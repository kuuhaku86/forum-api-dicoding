const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const Like = require('../../Domains/likes/entities/Like');
const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async addLike(like) {
    const { owner, commentId } = like;

    const query = {
      text: 'INSERT INTO likes (owner, comment_id) VALUES($1, $2) RETURNING owner, comment_id',
      values: [owner, commentId],
    };

    let result = undefined;

    try {
      result = await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }

    return new Like({ 
      commentId: result.rows[0].comment_id, 
      credentials: result.rows[0].owner, 
    });
  }

  async getLike({ owner, commentId }) {
    const query = {
      text: `SELECT * 
            FROM likes
            WHERE owner = $1
            AND comment_id = $2
            `,
      values: [owner, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('like tidak ditemukan');
    }

    return new Like({ 
      commentId: result.rows[0].comment_id, 
      credentials: result.rows[0].owner, 
    });
  }

  async deleteLike({ owner, commentId }) {
    const query = {
      text: `DELETE FROM likes 
            WHERE owner = $1
            AND comment_id = $2
            `,
      values: [owner, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('like tidak ditemukan');
    }
  }

  async getCountLikes(commentIds) {
    const query = {
      text: `SELECT comment_id, COUNT(likes.*) as count
            FROM likes
            WHERE comment_id = ANY($1::text[])
            GROUP BY comment_id
            `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;

