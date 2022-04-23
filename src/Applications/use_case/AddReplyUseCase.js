const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ commentRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const addReply = new AddReply(useCasePayload);

    await this._commentRepository.getComment({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });

    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;

