const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
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

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and persisted like when like not exist', async () => {
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
        threadId
      });
      const commentId = responseComment.data.addedComment.id;

      const lastUser = await UsersTableTestHelper.getLastUser();
      let likes  = await LikesTableTestHelper.findLike({
        credentials:  lastUser.id,
        commentId: commentId,
      });

      // Action
      const response = await server.inject({
        method:  'PUT',
        url:     `/threads/${threadId}/comments/${commentId}/likes`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(likes.length).toEqual(0);
      likes = await LikesTableTestHelper.findLike({
        credentials:  lastUser.id,
        commentId: commentId,
      });
      expect(likes.length).toEqual(1);
    });

    it('should response 200 and delete like when like exist', async () => {
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
        threadId
      });
      const commentId = responseComment.data.addedComment.id;

      const lastUser = await UsersTableTestHelper.getLastUser();
      await LikesTableTestHelper.addLike({
        owner: lastUser.id,
        commentId: commentId,
      });

      let likes  = await LikesTableTestHelper.findLike({
        credentials:  lastUser.id,
        commentId: commentId,
      });

      // Action
      const response = await server.inject({
        method:  'PUT',
        url:     `/threads/${threadId}/comments/${commentId}/likes`,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(likes.length).toEqual(1);
      likes = await LikesTableTestHelper.findLike({
        credentials:  lastUser.id,
        commentId: commentId,
      });
      expect(likes.length).toEqual(0);
    });

    it('should response 404 when comment not found', async () => {
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
        method:  'PUT',
        url:     `/threads/abcd/comments/abcd/likes`,
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
        method:  'PUT',
        url:     `/threads/abcd/comments/abcd/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});

