const models = require('../models');
const jwtUtils = require('../utils/jwtUtils');

const TITLE_LIMIT = 2;
const CONTENT_LIMIT = 4;
const ITEMS_LIMIT = 50;

exports.createPost = (req, res) => {
    // Headers 
    const headerAuth = req.headers['authorization'];
    const userId = jwtUtils.getUserId(headerAuth);

    // Params
    const title = req.body.title;
    const content = req.body.content;

    if (title == null || content == null) {
        return res.status(400).json({ error: 'missing parameters' });
    }

    if (title.length <= TITLE_LIMIT || content.length <= CONTENT_LIMIT) {
        return res.status(400).json({ error: 'invalid parameter' });
    }

    models.User.findOne({
        where: { id: userId }
    })
    .then(userFound => {
        if (userFound) {
            models.Post.create({
                title,
                content,
                likes  : 0,
                UserId : userFound.id
            })
            .then(newPost => res.status(201).json(newPost))
            .catch(err => res.status(404).json({ error: 'user not found' }));
        }    
    })
    .catch(error => res.status(500).json({ error: 'unable to verify user' }));
};

exports.listPosts = (req, res) => {
    // Params
    const fields = req.query.fields;
    const limit  = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const order  = req.query.order;

    if (limit > ITEMS_LIMIT) {
        limit = ITEMS_LIMIT;
    }

    models.Post.findAll({
        order: [(order != null) ? order.split(':') : ['title', 'ASC']],
        attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
        limit: (!isNaN(limit)) ? limit : null,
        offset: (!isNaN(offset)) ? offset : null,
        include: [{
            model: models.User,
            attributes: ['username']
        }]
    })
    .then(posts => {
        if (posts) {
            res.status(200).json(posts);
        } else {
            res.status(404).json({ error: 'no posts found' });
        }
    })
    .catch(error => res.status(500).json({ error: 'invalid fields' }));
};