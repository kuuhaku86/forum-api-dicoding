const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const Thread = require('../../../Domains/threads/entities/Thread');
const Comment = require('../../../Domains/comments/entities/Comment');
const Reply = require('../../../Domains/replies/entities/Reply');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe('GetThreadDetailUseCase', () => {
  it('should throw error 404 if thread not found', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('THREAD.NOT_FOUND')));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(getThreadDetailUseCase.execute(useCasePayload))
      .rejects
      .toThrowError(NotFoundError);
  });

  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };
    const reply = new Reply({
      id:       "reply-123",
      username: "username",
      date:     "123",
      content:  "content",
    });
    const comment = new Comment({
      id:       "comment-123",
      username: "username",
      date:     "123",
      content:  "content",
    });
    const replies = [
      reply,
      reply,
    ];
    const comments = [
      comment,
      comment,
      comment,
    ];

    const mockThreadRepository = new ThreadRepository();
    const thread = new Thread({
      id:      useCasePayload.threadId,
      title:   'test_title',
      body:    'test_body',
      date:    'test_date',
      username:'test_username', 
    });
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(thread));
    
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getComments = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getReplies = jest.fn()
      .mockImplementation(() => Promise.resolve(replies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository : mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository:   mockReplyRepository,
    });

    // Action
    const threadResponse = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.getComments)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(threadResponse).toBeInstanceOf(Thread);
    expect(threadResponse.id).toEqual(useCasePayload.threadId);
    expect(threadResponse.title).toEqual(thread.title);
    expect(threadResponse.body).toEqual(thread.body);
    expect(threadResponse.date).toEqual(thread.date);
    expect(threadResponse.username).toEqual(thread.username);
    expect(threadResponse.comments.length).toEqual(3);
    expect(threadResponse.comments).toStrictEqual(comments);
    expect(threadResponse.comments[0].replies[0]).toStrictEqual(replies[0]);
  });
});
