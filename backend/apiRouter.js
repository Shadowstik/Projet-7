const express = require('express');
const apiRouter = express.Router();

const usersCtrl = require('./controllers/user');
const postsCtrl = require('./controllers/post');

// User Routes
apiRouter.post('/users/signup/', usersCtrl.signup);
apiRouter.post('/users/login/', usersCtrl.login);
apiRouter.get('/users/me/', usersCtrl.getUserProfile);
apiRouter.put('/users/me/', usersCtrl.updateUserProfile);

// Post routes
apiRouter.post('/posts/new/', postsCtrl.createPost);
apiRouter.get('/posts/', postsCtrl.listPosts);

module.exports = apiRouter;