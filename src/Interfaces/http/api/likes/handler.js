const ToggleLikeUseCase = require('../../../../Applications/use_case/ToggleLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const toggleLikeUseCase = this._container.getInstance(ToggleLikeUseCase.name);

    await toggleLikeUseCase.execute({
      credentials: request.auth.credentials.id,
      threadId:    request.params.threadId,
      commentId:   request.params.commentId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);

    return response;
  }
}

module.exports = LikesHandler;
