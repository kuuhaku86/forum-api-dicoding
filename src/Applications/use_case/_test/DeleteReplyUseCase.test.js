const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const Comment = require('../../../Domains/comments/entities/Comment');
const Reply = require('../../../Domains/replies/entities/Reply');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe('DeleteReplyUseCase', () => {
  it('should throw error if use case payload not contain needed data', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      credentials:  123,
      threadId:     123,
      commentId:    213,
      replyId:      232,
    };
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error 404 if reply or comment or thread not found', async () => {
    // Arrange
    const useCasePayload = {
      credentials: 'user-123',
      threadId:    'thread-123',
      commentId:   'comment-123',
      replyId:     'reply-123',
    };

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.reject(new NotFoundError("test")));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError(NotFoundError);
  });

  it('should throw error 403 if reply\'s owner not same with the one who make request', async () => {
    // Arrange
    const useCasePayload = {
      credentials: 'user-123',
      threadId:    'thread-123',
      commentId:   'comment-123',
      replyId:     'reply-123',
    };
    const comment = new Comment({
      id:         "comment-123",
      username:   "username",
      date:       "123",
      owner:      "user-321",
      content:    "content",
      like_count: 1
    });
    const reply = new Reply({
      id:       "reply-123",
      username: "username",
      date:     "123",
      owner:    "user-321",
      content:  "content",
      comment_id: "comment-123",
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve(comment));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.verifyReplyAvailability = jest.fn(() => Promise.resolve(reply));
    mockReplyRepository.getOwner = jest.fn(() => Promise.resolve('testt-123'));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository:   mockReplyRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.NOT_REPLY_OWNER');
  });

  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      credentials: 'user-123',
      threadId:    'thread-123',
      commentId:   'comment-123',
      replyId:     'reply-123',
    };
    const comment = new Comment({
      id:         "comment-123",
      username:   "username",
      date:       "123",
      owner:      "user-123",
      content:    "content",
      like_count: 1
    });
    const reply = new Reply({
      id:       "reply-123",
      username: "username",
      date:     "123",
      owner:    "user-321",
      content:  "content",
      comment_id: "comment-123",
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve(comment));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.verifyReplyAvailability = jest.fn(() => Promise.resolve(reply));
    mockReplyRepository.getOwner = jest.fn(() => Promise.resolve(useCasePayload.credentials));
    mockReplyRepository.softDelete = jest.fn(() => Promise.resolve());;

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository:   mockReplyRepository,
    });

    // Action and Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).resolves.not.toThrowError(Error);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith({
        threadId:    useCasePayload.threadId,
        commentId:   useCasePayload.commentId,
      });
    expect(mockReplyRepository.verifyReplyAvailability)
      .toHaveBeenCalledWith({
        commentId:   useCasePayload.commentId,
        replyId:     useCasePayload.replyId,
      });
    expect(mockReplyRepository.getOwner)
      .toHaveBeenCalledWith(useCasePayload.replyId);
    expect(mockReplyRepository.softDelete)
      .toHaveBeenCalledWith(useCasePayload.replyId);
  });
});
