const pool = require('../../database/postgres/pool');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
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

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body:  'Dicoding Indonesia',
      };

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method:  'POST',
        url:     '/threads',
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);    
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

      // Action
      const response = await server.inject({
        method:  'POST',
        url:     '/threads',
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body:  ['Dicoding Indonesia'],
      };

      const server = await createServer(container);

      const accessToken = await getAccessTokenUser(server);
      const requestHeader = {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method:  'POST',
        url:     '/threads',
        payload: requestPayload,
        headers: requestHeader,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 401 when missing auth', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body:  'Dicoding Indonesia',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and returned thread', async () => {
      // Arrange
      const threadId = 'thread-123';

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({ id: threadId, content: "body: Dicoding Indonesia" });
      for (let i = 0; i < 3; i++) {
        await UsersTableTestHelper.addUser({ id: `user-123${i}`, username: `user_${i}` });
        const commentId = `comment-123${i}`;
        await CommentsTableTestHelper.addComment({ 
          id:       commentId, 
          threadId, 
          owner:    `user-123${i}` ,
          content:  `content-${i}`,
        });
        await LikesTableTestHelper.addLike({
          commentId,
          owner: `user-123${i}`
        });

        for (let j = 0; j < 2; j++) {
          await RepliesTableTestHelper.addReply({
            id:        `reply-123${i}${j}`,
            commentId,
            owner:     `user-123${i}` ,
            content:   `content-reply-${i}`,
          });
        }
      }

      // Action
      const response = await server.inject({
        method:  'GET',
        url:     `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.title).toEqual("Dicoding Indonesia");
      expect(responseJson.data.thread.body).toEqual("body: Dicoding Indonesia");
      expect(responseJson.data.thread.username).toEqual("dicoding");
      expect(responseJson.data.thread.comments.length).toEqual(3);
      expect(responseJson.data.thread.comments[0].replies.length).toEqual(2);

      for (let i = 0; i < 3; i++) {
        let comment = responseJson.data.thread.comments[i];
        
        expect(comment.id).toEqual(`comment-123${i}`);
        expect(comment.username).toEqual(`user_${i}`);
        expect(comment.content).toEqual(`content-${i}`);
        expect(comment.likeCount).toEqual(1);

        for (let j = 0; j < 2; j++) {
          let reply = comment.replies[j];

          expect(reply.id).toEqual(`reply-123${i}${j}`);
          expect(reply.username).toEqual(`user_${i}`);
          expect(reply.content).toEqual(`content-reply-${i}`);
        }
      }
    });

    it('should response 404 when thread not exist', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/abcd',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
