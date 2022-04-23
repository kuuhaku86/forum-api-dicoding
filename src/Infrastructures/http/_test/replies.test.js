const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

async function getAccessTokenUser(server) {
  // add user
  await server.inject({
    method: 'POST',
    url: '/users',
    payload: {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    },
  });

  const loginResponse = await server.inject({
    method: 'POST',
    url: '/authentications',
    payload: {
      username: 'dicoding',
      password: 'secret',
    },
  });
  const { data: { accessToken } } = JSON.parse(loginResponse.payload);

  return accessToken;
}

async function setupThread(server, header) {
  const requestThreadPayload = {
    title: 'dicoding',
    body:  'Dicoding Indonesia',
  };

  const responseThread = await server.inject({
    method:  'POST',
    url:     '/threads',
    payload: requestThreadPayload,
    headers: header,
  });

  return JSON.parse(responseThread.payload);
}

async function setupComment({ server, requestHeader, threadId }) {
    const requestPayloadComment = {
      content: "Test content comment"
    };

    const responseComment = await server.inject({
      method:  'POST',
      url:     `/threads/${threadId}/comments`,
      payload: requestPayloadComment,
      headers: requestHeader,
    });

    return JSON.parse(responseComment.payload);
}

async function setupReply({ server, requestHeader, threadId, commentId }) {
    const requestPayloadReply = {
      content: "Test content reply"
    };

    const responseReply = await server.inject({
      method:  'POST',
      url:     `/threads/${threadId}/comments/${commentId}/replies`,
      payload: requestPayloadReply,
      headers: requestHeader,
    });

    return JSON.parse(responseReply.payload);
}

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: "Test content reply"
      };

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      const responseThread = await setupThread(server, requestHeader);
      const threadId = responseThread.data.addedThread.id;

      const responseComment = await setupComment({
        server, 
        requestHeader,
        threadId
      });
      const commentId = responseComment.data.addedComment.id;

      // Action
      const response = await server.inject({
        method:  'POST',
        url:     `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);    
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        body: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      const responseThread = await setupThread(server, requestHeader);
      const threadId = responseThread.data.addedThread.id;

      const responseComment = await setupComment({
        server, 
        requestHeader,
        threadId
      });
      const commentId = responseComment.data.addedComment.id;

      // Action
      const response = await server.inject({
        method:  'POST',
        url:     `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content:  ['Dicoding Indonesia'],
      };
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      const responseThread = await setupThread(server, requestHeader);
      const threadId = responseThread.data.addedThread.id;

      const responseComment = await setupComment({
        server, 
        requestHeader,
        threadId
      });
      const commentId = responseComment.data.addedComment.id;

      // Action
      const response = await server.inject({
        method:  'POST',
        url:     `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread or comment not found', async () => {
      // Arrange
      const requestPayload = {
        content:  'Dicoding Indonesia',
      };
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url:     `/threads/abcd/comments/bcde/replies`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 401 when missing auth', async () => {
      // Arrange
      const requestPayload = {
        content:  'Dicoding Indonesia',
      };
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      const responseThread = await setupThread(server, requestHeader);
      const threadId = responseThread.data.addedThread.id;

      const responseComment = await setupComment({
        server, 
        requestHeader,
        threadId
      });
      const commentId = responseComment.data.addedComment.id;

      // Action
      const response = await server.inject({
        method: 'POST',
        url:     `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and soft delete reply', async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      const responseThread = await setupThread(server, requestHeader);
      const threadId = responseThread.data.addedThread.id;

      const responseComment = await setupComment({
        server, 
        requestHeader,
        threadId,
      });
      const commentId = responseComment.data.addedComment.id;

      const responseReply = await setupReply({
        server, 
        requestHeader,
        threadId,
        commentId,
      });
      const replyId = responseReply.data.addedReply.id;

      // Action
      const response = await server.inject({
        method:  'DELETE',
        url:     `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      const replies = await RepliesTableTestHelper.findReply(replyId);
      expect(replies[0].is_deleted).toBe(true);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url:     `/threads/abcd/comments/abcd/replies/abcd`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      const responseThread = await setupThread(server, requestHeader);
      const threadId = responseThread.data.addedThread.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url:     `/threads/${threadId}/comments/abcd/replies/abdc`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 404 when reply not found', async () => {
      // Arrange
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      const responseThread = await setupThread(server, requestHeader);
      const threadId = responseThread.data.addedThread.id;

      const responseComment = await setupComment({
        server, 
        requestHeader,
        threadId,
      });
      const commentId = responseComment.data.addedComment.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url:     `/threads/${threadId}/comments/${commentId}/replies/abdc`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('balasan tidak ditemukan');
    });

    it('should response 403 and not soft deleted', async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      const responseThread = await setupThread(server, requestHeader);
      const threadId = responseThread.data.addedThread.id;

      const responseComment = await setupComment({
        server, 
        requestHeader,
        threadId,
      });
      const commentId = responseComment.data.addedComment.id;

      const responseReply = await setupReply({
        server, 
        requestHeader,
        threadId,
        commentId,
      });
      const replyId = responseReply.data.addedReply.id;

      await UsersTableTestHelper.addUser({
        username: 'user2',
      });
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      // Action
      const response = await server.inject({
        method:  'DELETE',
        url:     `/threads/thread-123/comments/comment-123/replies/reply-123`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      let replies = await RepliesTableTestHelper.findReply(replyId);
      expect(replies[0].is_deleted).toBe(false);
      replies = await RepliesTableTestHelper.findReply("reply-123");
      expect(replies[0].is_deleted).toBe(false);
    });

    it('should response 401 when missing auth', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url:     `/threads/abcd/comments/abcd/replies/abcd`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
