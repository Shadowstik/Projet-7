// Imports
const jwtUtils = require('../utils/jwtUtils');
const bcrypt = require('bcrypt');
const models = require('../models');

// Constants
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{4,8}$/;

// Routes
exports.signup = (req, res) => {
    // Params
    const email = req.body.email;
    const username = req.body.username;
    const password =  req.body.password;
    const role =  req.body.role;

    if (email == null || username == null || password == null || role == null) {
        return res.status(400).json({ error: 'Missing a parameters'});
    }

    if (username.length >= 15 || username.length <= 3 || role.length <= 3) {
        return res.status(400).json({ error: 'wrong username (must be length 4 - 14)' });
    }

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'email invalid' });
    }

    if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({ error: 'password invalid (must length 4 - 8 and include 1 number at least)' });
    }

    models.User.findOne({
        attributes: ['email'],
        where: { email }
    })
    .then(userFound => {
        if (!userFound) {
            bcrypt.hash(password, 10, (err, hash) => {
                const newUser = models.User.create({
                    email,
                    username,
                    password: hash,
                    role,
                    isAdmin: 0
                })
                .then(newUser => res.status(201).json({ 'userId': newUser.id }))
                .catch(err => res.status(500).json({ error: 'unable to verify user'}));
            })
        } else {
            res.status(409).json({ error: 'user already exist'});
        }
    })
    .catch(err => res.status(500).json({ error: 'cannot add user'}));
};

exports.login = (req, res) => {
    // Params
    const email = req.body.email;
    const password = req.body.password;

    if (email == null || password == null) {
        return res.status(400).json({ error: 'missing parameters'});
    }

    models.User.findOne({
        where: { email }
    })
    .then(userFound => {
        if (userFound) {
            bcrypt.compare(password, userFound.password, (err, resCrypt) => {
                if (resCrypt) {
                    return res.status(201).json({
                        'userId': userFound.id,
                        'token': jwtUtils.generateTokenForUser(userFound)
                    });
                } else {
                    return res.status(403).json({ error: 'invalid password'});
                }
            })
        } else {
            return res.status(409).json({ error: 'user not exist in DB'});
        }
    })
    .catch(err => res.status(500).json({ error: 'unable to verify user'}));
};

exports.getUserProfile = (req, res) => {
    // Headers
    const headerAuth = req.headers['authorization'];
    const userId = jwtUtils.getUserId(headerAuth);

    if (userId < 0) {
        return res.status(400).json({ error: 'wrong token' });
    }

    models.User.findOne({
        attributes: ['id', 'email', 'username', 'role'],
        where: { id: userId }
    })
    .then(user => {
        if (user) {
            return res.status(201).json(user);
        } else {
            return res.status(404).json({ error: 'user not found' });
        }
    })
    .catch(error => res.status(500).json({ error: 'cannot fetch user' }));

};

exports.updateUserProfile = (req, res) => {
    // Headers 
    const headerAuth = req.headers['authorization'];
    const userId     = jwtUtils.getUserId(headerAuth);
    
    // Params
    const role   = req.body.role;

    models.User.findOne({
        attributes: ['id', 'role'],
        where: { id: userId }
    })
    .then(userFound => {
        if (userFound) {
            userFound.update({ role: (role ? role : userFound.role) });
            return res.status(201).json(userFound);
        } else {
            return res.status(404).json({ error: 'user not found' });
        } 
    })
    .catch(error => res.status(500).json({ error: 'cannot update user profile' }));
};