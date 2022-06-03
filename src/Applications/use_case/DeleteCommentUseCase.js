class DeleteCommentUseCase {
  constructor({
    commentRepository,
  }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const { credentials, threadId, commentId } = useCasePayload;

    await this._commentRepository.verifyCommentAvailability({
      threadId,
      commentId,
    });

    const ownerId = await this._commentRepository.getOwner(commentId);
    if (ownerId !== credentials) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_COMMENT_OWNER');
    }

    await this._commentRepository.softDelete(commentId);
  }

  _validatePayload(payload) {
    const { credentials, threadId, commentId } = payload;
    if (!credentials || !threadId || !commentId) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof credentials !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteCommentUseCase;
