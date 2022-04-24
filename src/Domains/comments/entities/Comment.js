class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;
    this.likeCount = payload.like_count;

    if (payload.is_deleted) {
      this.content = '**komentar telah dihapus**';
    } else {
      this.content = payload.content;
    }

    this.replies = [];
  }

  _verifyPayload(payload) {
    const { id, username, date, content, like_count } = payload;

    if (!id || !username || !date || !content) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || 
        typeof username !== 'string' || 
        typeof date !== 'string' || 
        typeof content !== 'string' ||
        typeof like_count !== 'number') {  
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  addReply(reply) {
    this.replies.push(reply);
  }
}

module.exports = Comment;