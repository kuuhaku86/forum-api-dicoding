class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.credentials = payload.credentials;
    this.threadId = payload.threadId;
    this.content = payload.content;
  }

  _verifyPayload(payload) {
    const { credentials, threadId, content } = payload;

    if (!credentials || !threadId || !content) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof credentials !== 'string' || typeof threadId !== 'string' || typeof content !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComment;
