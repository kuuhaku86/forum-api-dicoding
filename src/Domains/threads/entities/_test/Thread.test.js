const Thread = require('../Thread');

describe('Thread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      body: 'dicoding',
    };

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id:       123,
      title:    true,
      body:     ["test"],
      date:     true,
      username: 321,
    };

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Thread entities correctly', () => {
    // Arrange
    const payload = {
      id:       'thread-123',
      title:    'test_title',
      body:     "test",
      date:     "true",
      username: "user-321",
    };

    // Action
    const thread = new Thread(payload);

    // Assert
    expect(thread).toBeInstanceOf(Thread);
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.username).toEqual(payload.username);
  });

  it('should create Thread entities correctly and can add comment', () => {
    // Arrange
    const payload = {
      id:       'thread-123',
      title:    'test_title',
      body:     'test',
      date:     'true',
      username: 'user-321',
    };

    // Action
    const thread = new Thread(payload);
    thread.addComment({});
    thread.addComment({});
    thread.addComment({});

    // Assert
    expect(thread).toBeInstanceOf(Thread);
    expect(thread.comments.length).toEqual(3);
  });
});
