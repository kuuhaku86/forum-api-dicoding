const Reply = require('../Reply');

describe('Reply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      body: 'dicoding',
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id:       [1, 2, 3],
      content:  true,
      username: 'dicoding',
      date:     1234231,
      comment_id: 'comment-123',
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Reply entities correctly (not deleted)', () => {
    // Arrange
    const payload = {
      id:       'comment-123',
      content:  'content-123',
      username: 'dicoding',
      date:     'date-123',
      comment_id: 'comment-123',
    };

    // Action
    const reply = new Reply(payload);

    // Assert
    expect(reply).toBeInstanceOf(Reply);
    expect(reply.id).toEqual(payload.id);
    expect(reply.content).toEqual(payload.content);
    expect(reply.username).toEqual(payload.username);
    expect(reply.date).toEqual(payload.date);
  });

  it('should create Reply entities correctly (deleted)', () => {
    // Arrange
    const payload = {
      id:         'comment-123',
      content:    'content-123',
      username:   'dicoding',
      date:       'date-123',
      is_deleted: true,
      comment_id: 'comment-123',
    };

    // Action
    const reply = new Reply(payload);

    // Assert
    expect(reply).toBeInstanceOf(Reply);
    expect(reply.id).toEqual(payload.id);
    expect(reply.content).toEqual("**balasan telah dihapus**");
    expect(reply.username).toEqual(payload.username);
    expect(reply.date).toEqual(payload.date);
  });
});

