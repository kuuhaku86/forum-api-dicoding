const Comment = require('../Comment');

describe('Comment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      body: 'dicoding',
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id:       [1, 2, 3],
      content:  true,
      username: 'dicoding',
      date:     1234231,
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Comment entities correctly (not deleted)', () => {
    // Arrange
    const payload = {
      id:       'comment-123',
      content:  'content-123',
      username: 'dicoding',
      date:     'date-123',
    };

    // Action
    const addComment = new Comment(payload);

    // Assert
    expect(addComment).toBeInstanceOf(Comment);
    expect(addComment.id).toEqual(payload.id);
    expect(addComment.content).toEqual(payload.content);
    expect(addComment.username).toEqual(payload.username);
    expect(addComment.date).toEqual(payload.date);
  });

  it('should create Comment entities correctly (deleted)', () => {
    // Arrange
    const payload = {
      id:         'comment-123',
      content:    'content-123',
      username:   'dicoding',
      date:       'date-123',
      is_deleted: true
    };

    // Action
    const addComment = new Comment(payload);

    // Assert
    expect(addComment).toBeInstanceOf(Comment);
    expect(addComment.id).toEqual(payload.id);
    expect(addComment.content).toEqual("**komentar telah dihapus**");
    expect(addComment.username).toEqual(payload.username);
    expect(addComment.date).toEqual(payload.date);
  });

  it('should create Comment entity correctly and can add reply', () => {
    // Arrange
    const payload = {
      id:       'thread-123',
      username: 'user-321',
      date:     'true',
      content:  'test_content',
    };

    // Action
    const comment = new Comment(payload);
    comment.addReply({});
    comment.addReply({});
    comment.addReply({});

    // Assert
    expect(comment).toBeInstanceOf(Comment);
    expect(comment.replies.length).toEqual(3);
  });
});
