class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    const thread = await this._threadRepository.getThread(threadId);
    const comments = await this._commentRepository.getComments(threadId);
    const commentIds = await comments.map(comment => comment.id);
    const replies = await this._replyRepository.getReplies(commentIds);

    for (const i in comments) {
      const comment = comments[i];
      const repliesForComment = await replies.filter(reply => reply.commentId === comment.id);
      
      for (const j in repliesForComment) {
        const reply = repliesForComment[j];

        comment.addReply(reply);
      }

      thread.addComment(comment);
    }

    return thread;
  }
}

module.exports = GetThreadDetailUseCase;