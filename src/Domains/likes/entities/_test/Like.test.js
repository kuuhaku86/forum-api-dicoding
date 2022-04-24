const Like = require('../Like');

describe('Like entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      body: 'dicoding',
    };

    // Action & Assert
    expect(() => new Like(payload)).toThrowError('LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      credentials: true,
      commentId:   'dicoding',
    };

    // Action & Assert
    expect(() => new Like(payload)).toThrowError('LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Like entities correctly', () => {
    // Arrange
    const payload = {
      credentials: 'user-123',
      commentId:   'dicoding',
    };

    // Action
    const like = new Like(payload);

    // Assert
    expect(like).toBeInstanceOf(Like);
    expect(like.owner).toEqual(payload.credentials);
    expect(like.commentId).toEqual(payload.commentId);
  });
});


