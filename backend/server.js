const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./apiRouter');

const app = express();

app.use(cors());

// Parse application/x-www-form-urlencoded & application/json
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json()); 

app.use('/api/', apiRouter);

// Set PORT listen for resquests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}.`);
});