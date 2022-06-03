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
    const commentIds = await comments.map(comment => comment.id);
    const replies = await this._replyRepository.getReplies(commentIds);

    thread.comments = comments.map(comment => {
      comment.replies = replies.filter(reply => reply.commentId === comment.id);
      return comment
    })

    return thread;
  }
}

module.exports = GetThreadDetailUseCase;