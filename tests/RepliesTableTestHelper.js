/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', 
    owner = 'user-123',
    commentId = 'comment-123',
    content = 'Dicoding Indonesia', 
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, CURRENT_TIMESTAMP, $4)',
      values: [id, owner, commentId, content],
    };

    await pool.query(query);
  },

  async findReply(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
