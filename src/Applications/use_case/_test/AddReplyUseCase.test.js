const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const Comment = require('../../../Domains/comments/entities/Comment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      credentials: 'dicoding',
      content:     'test_content',
      commentId:   'comment-123',
    };
    const comment = new Comment({
      id:       'comment-123',
      username: useCasePayload.credentials,
      date:     'test-date',
      content:  'test-content-comment'
    });
    const expectedAddedReply = new AddedReply({
      id:       'reply-123',
      owner:     useCasePayload.credentials,
      content:  'test-content'
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockCommentRepository.getComment = jest.fn()
      .mockImplementation(() => Promise.resolve(comment));
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReply));

    /** creating use case instance */
    const addCommentUseCase = new AddReplyUseCase({
      replyRepository:   mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedReply);
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      credentials: useCasePayload.credentials,
      content:     useCasePayload.content,
      commentId:   useCasePayload.commentId,
    }));
  });
});

