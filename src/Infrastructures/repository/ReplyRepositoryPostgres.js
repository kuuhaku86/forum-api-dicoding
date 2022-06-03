const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const Reply = require('../../Domains/replies/entities/Reply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { credentials, content, commentId } = addReply;

    const id = `reply-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO replies (id, owner, comment_id, content) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, credentials, commentId, content],
    };

    let result = undefined;

    try {
      result = await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }

    return new AddedReply({ ...result.rows[0] });
  }

  async getOwner(replyId) {
    const query = {
      text: `SELECT owner 
            FROM replies
            WHERE id = $1
            `,
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    return result.rows[0].owner;
  }

  async verifyReplyAvailability({ commentId, replyId }) {
    const query = {
      text: `SELECT replies.*, 
                    users.username
            FROM replies
            JOIN users ON replies.owner = users.id
            WHERE replies.id = $1
            AND replies.comment_id = $2
            `,
      values: [replyId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    const date = (new Date(result.rows[0].date)).toISOString();

    return new Reply({
      ...result.rows[0],
      date,
    });
  }

  async softDelete(id) {
    const query = {
      text: `UPDATE replies 
            SET is_deleted=true
            WHERE id = $1
            `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async getReplies(commentIds) {
    const query = {
      text: `SELECT replies.*, 
                    users.username
            FROM replies
            JOIN users ON replies.owner = users.id
            WHERE replies.comment_id = ANY($1::text[])
            ORDER BY replies.date ASC
            `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    let replies = [];

    for (let i = 0; i < result.rows.length; i++) {
      const reply = result.rows[i];
      const date = (new Date(reply.date)).toISOString();

      replies.push(new Reply({
        ...reply,
        date,
      }));
    }

    return replies;
  }
}

module.exports = ReplyRepositoryPostgres;
