const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      credentials: 'dicoding',
      title:       'test_title',
      body:        'Dicoding Indonesia',
    };
    const expectedAddedThread = new AddedThread({
      id:       'thread-123',
      title:    useCasePayload.title,
      owner:    useCasePayload.credentials,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(new AddedThread({
      id:       'thread-123',
      title:    useCasePayload.title,
      owner:    useCasePayload.credentials,
    })));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread({
      credentials: useCasePayload.credentials,
      title:       useCasePayload.title,
      body:        useCasePayload.body,
    }));
  });
});
