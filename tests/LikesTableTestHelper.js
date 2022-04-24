/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    owner = 'user-123',
    commentId = 'comment-123',
  }) {
    const query = {
      text: 'INSERT INTO likes (owner, comment_id) VALUES($1, $2)',
      values: [owner, commentId],
    };

    await pool.query(query);
  },

  async findLike({
    credentials = 'user-123',
    commentId = 'comment-123',
  }) {
    const query = {
      text: 'SELECT * FROM likes WHERE owner = $1 AND comment_id = $2',
      values: [credentials, commentId],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
