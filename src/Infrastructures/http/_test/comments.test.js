const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
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

async function setupComment({ server, requestHeader, url }) {
    const requestPayloadComment = {
      content: "Test content comment"
    };

    const responseComment = await server.inject({
      method:  'POST',
      url:     url,
      payload: requestPayloadComment,
      headers: requestHeader,
    });

    return JSON.parse(responseComment.payload);
}

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: "Test content comment"
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

      // Action
      const response = await server.inject({
        method:  'POST',
        url:     `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);    
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

      // Action
      const response = await server.inject({
        method:  'POST',
        url:     `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
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

      // Action
      const response = await server.inject({
        method:  'POST',
        url:     `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread not found', async () => {
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
        url:     `/threads/abcd/comments`,
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('thread tidak ditemukan');
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url:     `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and soft delete comment', async () => {
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
        url: `/threads/${responseThread.data.addedThread.id}/comments`,
      });
      const commentId = responseComment.data.addedComment.id;

      // Action
      const response = await server.inject({
        method:  'DELETE',
        url:     `/threads/${threadId}/comments/${commentId}`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      const comments = await CommentsTableTestHelper.findComment(commentId);
      expect(comments[0].is_deleted).toBe(true);
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
        url:     `/threads/abcd/comments/abcd`,
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
        url:     `/threads/${threadId}/comments/abcd`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.message).toEqual('comment tidak ditemukan');
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('comment tidak ditemukan');
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
        url: `/threads/${threadId}/comments`,
      });
      const commentId = responseComment.data.addedComment.id;

      await UsersTableTestHelper.addUser({
        username: "test_321"
      });
      await CommentsTableTestHelper.addComment({
        threadId: threadId,
      });

      // Action
      const response = await server.inject({
        method:  'DELETE',
        url:     `/threads/${threadId}/comments/comment-123`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      let comments = await CommentsTableTestHelper.findComment(commentId);
      expect(comments[0].is_deleted).toBe(false);
      comments = await CommentsTableTestHelper.findComment("comment-123");
      expect(comments[0].is_deleted).toBe(false);
    });

    it('should response 401 when missing auth', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url:     `/threads/abcd/comments/abcd`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
