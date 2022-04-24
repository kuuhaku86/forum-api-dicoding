const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const AddReply = require('../../../Domains/replies/entities/AddReply');
const Reply = require('../../../Domains/replies/entities/Reply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should throw error 400 when foreign key user invalid', async () => {
      // Arrange
      const addReply = new AddReply({
        credentials: 'user-321',
        content:     'test_content',
        commentId:   'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action and Assert
      expect(replyRepositoryPostgres.addReply(addReply)).rejects.toThrow(InvariantError);
      const replies = await RepliesTableTestHelper.findReply('reply-123');
      expect(replies).toHaveLength(0);
    });

    it('should throw error 400 when foreign key comment invalid', async () => {
      // Arrange
      const addReply = new AddReply({
        credentials: 'user-123',
        content:     'test_content',
        commentId:   'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action and Assert
      expect(replyRepositoryPostgres.addReply(addReply)).rejects.toThrow(InvariantError);
      const replies = await RepliesTableTestHelper.findReply('reply-123');
      expect(replies).toHaveLength(0);
    });

    it('should persist reply and return added reply', async () => {
      // Arrange
      const addReply = new AddReply({
        credentials: 'user-123',
        content:     'test_content',
        commentId:   'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(addReply);

      // Assert
      const replies = await RepliesTableTestHelper.findReply('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        credentials: 'user-123',
        content:     'test_content',
        commentId:   'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id:      'reply-123',
        content: 'test_content',
        owner:   'user-123',
      }));
    });
  });

  describe('getReply function', () => {
    it('should throw error 400 when reply id or comment id or thread id invalid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      expect(replyRepositoryPostgres.getReply({ 
        threadId:  'thread-123',
        commentId: 'comment-123',
        replyId:   'reply-123',
      })).rejects.toThrow(NotFoundError);
    });

    it('should return reply', async () => {
      // Arrange
      const payload = {
        threadId:  'thread-123',
        commentId: 'comment-123',
        replyId:   'reply-123',
      };
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({ id: payload.threadId });
      await CommentsTableTestHelper.addComment({ id: payload.commentId });
      await RepliesTableTestHelper.addReply({ id: payload.replyId });

      // Action
      const reply = await replyRepositoryPostgres.getReply(payload);

      // Assert
      const replies = await RepliesTableTestHelper.findReply('reply-123');
      expect(replies).toHaveLength(1);
      const date = (new Date(replies[0].date)).toISOString();

      expect(reply.id).toBe(replies[0].id);
      expect(reply.content).toBe(replies[0].content);
      expect(reply.date).toBe(date);
      expect(reply.username).toBe('dicoding');
      expect(reply).toBeInstanceOf(Reply);
    });
  });

  describe('getOwner function', () => {
    it('should throw error 400 when reply id invalid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      expect(replyRepositoryPostgres.getOwner('reply-123')).rejects.toThrow(NotFoundError);
    });

    it('should return reply id', async () => {
      // Arrange
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const ownerId = await replyRepositoryPostgres.getOwner(replyId);

      // Assert
      expect(ownerId).toStrictEqual('user-123');
    });
  });

  describe('softDelete function', () => {
    it('should throw error 400 when reply id invalid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      expect(replyRepositoryPostgres.softDelete('comment-123')).rejects.toThrow(NotFoundError);
    });

    it('should soft delete reply successfully', async () => {
      // Arrange
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const reply = await replyRepositoryPostgres.softDelete(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findReply(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_deleted).toBe(true);
    });
  });

  describe('getReplies function', () => {
    it('should return replies', async () => {
      // Arrange
      const replyId = 'reply-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      for (let index = 0; index < 3; index++) {
        await RepliesTableTestHelper.addReply({ id: replyId + index });
      }

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getReplies([commentId]);

      // Assert
      expect(replies).toHaveLength(3);

      for (let index = 0; index < 3; index++) {
        let reply = replies[index];

        expect(reply.id).toBe(replyId + index);
        expect(reply.content).toBe(replies[0].content);
        expect(reply.username).toBe('dicoding');
        expect(reply).toBeInstanceOf(Reply);
      }
    });
  });
});

