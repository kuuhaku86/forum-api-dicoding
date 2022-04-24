class Like {
  constructor(payload) {
    this._verifyPayload(payload);

    this.owner = payload.credentials;
    this.commentId = payload.commentId;
  }

  _verifyPayload(payload) {
    const { credentials, commentId } = payload;

    if (!credentials || !commentId) {
      throw new Error('LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof credentials !== 'string' || typeof commentId !== 'string') {
      throw new Error('LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Like;


