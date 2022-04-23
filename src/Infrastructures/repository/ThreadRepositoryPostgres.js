const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const Thread = require('../../Domains/threads/entities/Thread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread) {
    const { credentials, title, body } = addThread;

    const id = `thread-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id, title, owner',
      values: [id, credentials, title, body],
    };

    let result = undefined;

    try {
      result = await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }

    return new AddedThread({ ...result.rows[0] });
  }

  async getThread(id) {
    const query = {
      text: `SELECT threads.id, 
                    threads.title, 
                    threads.body, 
                    threads.date, 
                    threads.owner,
                    users.username 
            FROM threads 
            JOIN users ON threads.owner = users.id
            WHERE threads.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const date = (new Date(result.rows[0].date)).toISOString();

    return new Thread({
      ...result.rows[0],
      date,
    });
  }
}

module.exports = ThreadRepositoryPostgres;