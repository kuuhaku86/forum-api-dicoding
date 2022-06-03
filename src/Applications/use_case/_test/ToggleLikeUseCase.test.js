const Like = require('../../../Domains/likes/entities/Like');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ToggleLikeUseCase = require('../ToggleLikeUseCase');

describe('ToggleLikeUseCase', () => {
  it('should orchestrating the add comment action correctly when like not exist', async () => {
    // Arrange
    const useCasePayload = {
      credentials: 'dicoding',
      commentId:   'comment-123',
      threadId:   'thread-123',
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const like = new Like(useCasePayload);

    /** mocking needed function */
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.getLike = jest.fn(() => Promise.reject());
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve(new Like({
      commentId:    useCasePayload.commentId,
      credentials:  useCasePayload.credentials,
    })));

    /** creating use case instance */
    const toggleLikeUseCase = new ToggleLikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository:    mockLikeRepository,
    });

    // Action and Assert
    await expect(toggleLikeUseCase.execute(useCasePayload)).resolves.not.toThrowError(Error);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCasePayload);
    expect(mockLikeRepository.getLike).toBeCalledWith(like);
    expect(mockLikeRepository.addLike).toBeCalledWith(like);
  });

  it('should orchestrating the add comment action correctly when like exist', async () => {
    // Arrange
    const useCasePayload = {
      credentials: 'dicoding',
      commentId:   'comment-123',
      threadId:   'thread-123',
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const like = new Like(useCasePayload);

    /** mocking needed function */
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.getLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const toggleLikeUseCase = new ToggleLikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository:    mockLikeRepository,
    });

    // Action and Assert
    await expect(toggleLikeUseCase.execute(useCasePayload)).resolves.not.toThrowError(Error);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCasePayload);
    expect(mockLikeRepository.getLike).toBeCalledWith(like);
    expect(mockLikeRepository.deleteLike).toBeCalledWith(like);
  });
});
