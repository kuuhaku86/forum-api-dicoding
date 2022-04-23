class AddThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.credentials = payload.credentials;
    this.title = payload.title;
    this.body = payload.body;
  }

  _verifyPayload(payload) {
    const { credentials, title, body } = payload;

    if (!credentials || !title || !body) {
      throw new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof credentials !== 'string' || typeof title !== 'string' || typeof body !== 'string') {
      throw new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddThread;
