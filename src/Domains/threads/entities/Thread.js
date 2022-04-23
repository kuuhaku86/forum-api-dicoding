class Thread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.title = payload.title;
    this.body = payload.body;
    this.date = payload.date;
    this.username = payload.username;
    this.comments = [];
  }

  _verifyPayload(payload) {
    const { id, title, body, date, username } = payload;

    if (!id || !title || !body || !date || !username) {
      throw new Error('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || 
        typeof title !== 'string' || 
        typeof body !== 'string' || 
        typeof date !== 'string' || 
        typeof username !== 'string') {
      throw new Error('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  addComment(comment) {
    this.comments.push(comment);
  }
}

module.exports = Thread;
