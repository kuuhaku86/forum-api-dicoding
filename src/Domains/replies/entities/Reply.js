class Reply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;
    this.commentId = payload.comment_id;

    if (payload.is_deleted) {
      this.content = '**balasan telah dihapus**';
    } else {
      this.content = payload.content;
    }
  }

  _verifyPayload(payload) {
    const { id, username, date, content, comment_id } = payload;

    if (!id || !username || !date || !content || !comment_id) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || 
        typeof username !== 'string' || 
        typeof date !== 'string' || 
        typeof content !== 'string' ||
        typeof comment_id !== 'string') {   
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
