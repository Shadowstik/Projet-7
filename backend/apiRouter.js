const express = require('express');
const apiRouter = express.Router();

const usersCtrl = require('./controllers/user');

// User Routes
apiRouter.post('/users/signup/', usersCtrl.signup);
apiRouter.post('/users/login/', usersCtrl.login);
apiRouter.get('/users/me/', usersCtrl.getUserProfile);
apiRouter.put('/users/me/', usersCtrl.updateUserProfile);

module.exports = apiRouter;