const CommentRepository = require('../../../Domains/comments/CommentRepository');
const Comment = require('../../../Domains/comments/entities/Comment');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe('DeleteCommentUseCase', () => {
  it('should throw error if use case payload not contain needed data', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      credentials:  123,
      threadId:     123,
      commentId:    213,
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error 404 if comment or thread not found', async () => {
    // Arrange
    const useCasePayload = {
      credentials: 'user-123',
      threadId:    'thread-123',
      commentId:   'comment-123',
    };

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getComment = jest.fn()
      .mockImplementation(() => Promise.reject(new NotFoundError("comment tidak ditemukan")));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError(NotFoundError);
  });

  it('should throw error 403 if comment\'s owner not same with the one who make request', async () => {
    // Arrange
    const useCasePayload = {
      credentials: 'user-123',
      threadId:    'thread-123',
      commentId:   'comment-123',
    };
    const comment = new Comment({
      id:       "comment-123",
      username: "username",
      date:     "123",
      owner:    "user-321",
      content:  "content",
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getComment = jest.fn()
      .mockImplementation(() => Promise.resolve(comment));
    mockCommentRepository.getOwner = jest.fn()
      .mockImplementation(() => Promise.resolve('testt-123'));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_COMMENT_OWNER');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      credentials: 'user-123',
      threadId:    'thread-123',
      commentId:   'comment-123',
    };
    const comment = new Comment({
      id:       "comment-123",
      username: "username",
      date:     "123",
      owner:    "user-123",
      content:  "content",
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getComment = jest.fn()
      .mockImplementation(() => Promise.resolve(comment));
    mockCommentRepository.getOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(useCasePayload.credentials));
    mockCommentRepository.softDelete = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action and Assert
    expect(deleteCommentUseCase.execute(useCasePayload)).resolves.not.toThrowError(Error);
    expect(mockCommentRepository.getComment)
      .toHaveBeenCalledWith({
        threadId:    useCasePayload.threadId,
        commentId:   useCasePayload.commentId,
      });
  });
});
