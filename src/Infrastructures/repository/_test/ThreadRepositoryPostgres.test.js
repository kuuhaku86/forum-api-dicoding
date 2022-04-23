const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const Thread = require('../../../Domains/threads/entities/Thread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should throw error 400 when user invalid', async () => {
      // Arrange
      const addThread = new AddThread({
        credentials: 'user-123',
        title:       'test_title',
        body:        'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action and Assert
      expect(threadRepositoryPostgres.addThread(addThread)).rejects.toThrow(InvariantError);
      const threads = await ThreadsTableTestHelper.findThread('thread-123');
      expect(threads).toHaveLength(0);
    });

    it('should persist thread and return added thread', async () => {
      // Arrange
      const addThread = new AddThread({
        credentials: 'user-123',
        title:       'test_title',
        body:        'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!

      await UsersTableTestHelper.addUser({});

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThread('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        credentials: 'user-123',
        title:       'test_title',
        body:        'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!

      await UsersTableTestHelper.addUser({});

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id:    'thread-123',
        title: 'test_title',
        owner: 'user-123',
      }));
    });
  });

  describe('getThread function', () => {
    it('should throw error 400 when thread id invalid', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      expect(threadRepositoryPostgres.getThread('thread-123')).rejects.toThrow(NotFoundError);
    });

    it('should persist thread and return thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThread('thread-123');

      // Assert
      const threads = await ThreadsTableTestHelper.findThread('thread-123');
      expect(threads).toHaveLength(1);
      const date = (new Date(threads[0].date)).toISOString();
      expect(thread.id).toBe(threads[0].id);
      expect(thread.title).toBe(threads[0].title);
      expect(thread.body).toBe(threads[0].body);
      expect(thread.date).toBe(date);
      expect(thread.username).toBe('dicoding');
      expect(thread).toBeInstanceOf(Thread);
    });
  });
});
