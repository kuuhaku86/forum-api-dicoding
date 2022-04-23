class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.credentials = payload.credentials;
    this.commentId = payload.commentId;
    this.content = payload.content;
  }

  _verifyPayload(payload) {
    const { credentials, commentId, content } = payload;

    if (!credentials || !commentId || !content) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof credentials !== 'string' || typeof commentId !== 'string' || typeof content !== 'string') {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReply;

