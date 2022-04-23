const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const AddComment = require('../../../Domains/comments/entities/AddComment');
const Comment = require('../../../Domains/comments/entities/Comment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should throw error 400 when foreign key user invalid', async () => {
      // Arrange
      const addComment = new AddComment({
        credentials: 'user-321',
        content:     'test_content',
        threadId:    'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action and Assert
      expect(commentRepositoryPostgres.addComment(addComment)).rejects.toThrow(InvariantError);
      const comments = await CommentsTableTestHelper.findComment('comment-123');
      expect(comments).toHaveLength(0);
    });

    it('should throw error 400 when foreign key thread invalid', async () => {
      // Arrange
      const addComment = new AddComment({
        credentials: 'user-123',
        content:     'test_content',
        threadId:    'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!

      await UsersTableTestHelper.addUser({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action and Assert
      expect(commentRepositoryPostgres.addComment(addComment)).rejects.toThrow(InvariantError);
      const comments = await CommentsTableTestHelper.findComment('comment-123');
      expect(comments).toHaveLength(0);
    });

    it('should persist comment and return added comment', async () => {
      // Arrange
      const addComment = new AddComment({
        credentials: 'user-123',
        content:     'test_content',
        threadId:    'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comments = await CommentsTableTestHelper.findComment('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        credentials: 'user-123',
        content:     'test_content',
        threadId:    'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id:      'comment-123',
        content: 'test_content',
        owner:   'user-123',
      }));
    });
  });

  describe('getComment function', () => {
    it('should throw error 400 when comment id or thread id invalid', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(commentRepositoryPostgres.getComment({ 
        threadId:  'thread-123',
        commentId: 'comment-123',
      })).rejects.toThrow(NotFoundError);
    });

    it('should return comment', async () => {
      // Arrange
      const payload = {
        threadId:  'thread-123',
        commentId: 'comment-123',
      };

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({ id: payload.threadId });
      await CommentsTableTestHelper.addComment({ id: payload.commentId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getComment(payload);

      // Assert
      const comments = await CommentsTableTestHelper.findComment(payload.commentId);
      expect(comments).toHaveLength(1);

      const date = (new Date(comments[0].date)).toISOString();
      expect(comment.id).toBe(comments[0].id);
      expect(comment.content).toBe(comments[0].content);
      expect(comment.date).toBe(date);
      expect(comment.username).toBe('dicoding');
      expect(comment).toBeInstanceOf(Comment);
    });
  });

  describe('getOwner function', () => {
    it('should throw error 400 when comment id invalid', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(commentRepositoryPostgres.getOwner('comment-123')).rejects.toThrow(NotFoundError);
    });

    it('should return owner id', async () => {
      // Arrange
      const threadId =  'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const ownerId = await commentRepositoryPostgres.getOwner(commentId);

      // Assert
      expect(ownerId).toStrictEqual('user-123');
    });
  });

  describe('softDelete function', () => {
    it('should throw error 400 when comment id invalid', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(commentRepositoryPostgres.softDelete('comment-123')).rejects.toThrow(NotFoundError);
    });

    it('should soft delete comment successfully', async () => {
      // Arrange
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({ id: commentId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.softDelete(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findComment(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toBe(true);
    });
  });

  describe('getComments function', () => {
    it('should return comments', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({ id: threadId });
      for (let index = 0; index < 3; index++) {
        await CommentsTableTestHelper.addComment({ id: commentId + index });
      }

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getComments(threadId);

      // Assert
      expect(comments).toHaveLength(3);

      for (let index = 0; index < 3; index++) {
        let comment = comments[index];

        expect(comment.id).toBe(commentId + index);
        expect(comment.content).toBe(comments[0].content);
        expect(comment.username).toBe('dicoding');
        expect(comment).toBeInstanceOf(Comment);
      }
    });
  });
});
