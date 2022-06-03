class DeleteReplyUseCase {
  constructor({
    commentRepository,
    replyRepository,
  }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const { credentials, threadId, commentId, replyId } = useCasePayload;

    await this._commentRepository.verifyCommentAvailability({
      threadId,
      commentId,
    });
    await this._replyRepository.verifyReplyAvailability({
      commentId,
      replyId,
    });

    const ownerId = await this._replyRepository.getOwner(replyId);
    if (ownerId !== credentials) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_REPLY_OWNER');
    }

    await this._replyRepository.softDelete(replyId);
  }

  _validatePayload(payload) {
    const { credentials, threadId, commentId, replyId } = payload;
    if (!credentials || !threadId || !commentId || !replyId) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof credentials !== 'string' ||
        typeof threadId !== 'string' ||
        typeof commentId !== 'string' ||
        typeof replyId !== 'string') {
      throw new Error('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyUseCase;
