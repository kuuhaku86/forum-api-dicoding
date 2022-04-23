class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    const thread = await this._threadRepository.getThread(threadId);
    const comments = await this._commentRepository.getComments(threadId);

    for (const i in comments) {
      const comment = comments[i];
      const replies = await this._replyRepository.getReplies(comment.id);

      for (const j in replies) {
        const reply = replies[j];

        comment.addReply(reply);
      }

      thread.addComment(comment);
    }

    return thread;
  }
}

module.exports = GetThreadDetailUseCase;