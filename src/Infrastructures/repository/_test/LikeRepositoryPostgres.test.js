const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const Like = require('../../../Domains/likes/entities/Like');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should throw error 400 when foreign key user invalid', async () => {
      // Arrange
      const like = new Like({
        credentials: 'user-321',
        commentId:   'comment-123',
      });

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action and Assert
      expect(likeRepositoryPostgres.addLike(like)).rejects.toThrow(InvariantError);
      const likes = await LikesTableTestHelper.findLike({
        credentials: 'user-321',
        commentId: 'comment-123',
      });
      expect(likes).toHaveLength(0);
    });

    it('should throw error 400 when foreign key comment invalid', async () => {
      // Arrange
      const like = new Like({
        credentials: 'user-123',
        content:     'test_content',
        commentId:   'comment-123',
      });

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action and Assert
      expect(likeRepositoryPostgres.addLike(like)).rejects.toThrow(InvariantError);
      const likes = await LikesTableTestHelper.findLike({
        credentials: 'user-123',
        commentId: 'comment-123',
      });
      expect(likes).toHaveLength(0);
    });

    it('should persist like', async () => {
      // Arrange
      const like = new Like({
        credentials: 'user-123',
        commentId:   'comment-123',
      });

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      await likeRepositoryPostgres.addLike(like);

      // Assert
      const likes = await LikesTableTestHelper.findLike({
        credentials: 'user-123',
        commentId: 'comment-123',
      });
      expect(likes).toHaveLength(1);
    });
  });

  describe('getLike function', () => {
    it('should throw error 400 when user id or comment id', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action and Assert
      expect(likeRepositoryPostgres.getLike({ 
        commentId:   'comment-123',
        owner: 'user-123',
      })).rejects.toThrow(NotFoundError);
    });

    it('should return like', async () => {
      // Arrange
      const payload = {
        commentId:   'comment-123',
        owner: 'user-123',
      };
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await LikesTableTestHelper.addLike({});

      // Action
      const like = await likeRepositoryPostgres.getLike(payload);

      // Assert
      const likes = await LikesTableTestHelper.findLike(payload);
      expect(likes).toHaveLength(1);
      const date = (new Date(likes[0].date)).toISOString();

      expect(like.owner).toBe(likes[0].owner);
      expect(like.commentId).toBe(likes[0].comment_id);
      expect(like).toBeInstanceOf(Like);
    });
  });

  describe('deleteLike function', () => {
    it('should throw error 400 when like id invalid', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);
      const like = new Like({
        credentials: 'user-123',
        commentId:   'comment-123',
      });

      // Action and Assert
      expect(likeRepositoryPostgres.deleteLike(like)).rejects.toThrow(NotFoundError);
    });

    it('should delete like successfully', async () => {
      // Arrange
      const like = new Like({
        credentials: 'user-123',
        commentId:   'comment-123',
      });

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await LikesTableTestHelper.addLike({});

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      await likeRepositoryPostgres.deleteLike(like);

      // Assert
      const likes = await LikesTableTestHelper.findLike(like);
      expect(likes).toHaveLength(0);
    });
  });

  describe('getCountLikes function', () => {
    it('should return count of likes', async () => {
      // Arrange
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({});
      for (let index = 0; index < 3; index++) {
        await UsersTableTestHelper.addUser({ id: `user-${index}`, username: `user${index}` });
      }
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      for (let index = 0; index < 3; index++) {
        await LikesTableTestHelper.addLike({ owner: `user-${index}` });
      }

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      const count = await likeRepositoryPostgres.getCountLikes([commentId]);

      // Assert
      expect(count[0].count).toBe(3);
    });
  });
});


