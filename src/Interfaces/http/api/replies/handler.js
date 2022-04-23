const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

    const addedReply = await addReplyUseCase.execute({
      credentials: request.auth.credentials.id,
      threadId:    request.params.threadId,
      commentId:   request.params.commentId,
      ...request.payload,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);

    return response;
  }

  async deleteReplyHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);

    await deleteReplyUseCase.execute({
      credentials: request.auth.credentials.id,
      threadId:    request.params.threadId,
      commentId:   request.params.commentId,
      replyId:     request.params.replyId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);

    return response;
  }
}

module.exports = RepliesHandler;
