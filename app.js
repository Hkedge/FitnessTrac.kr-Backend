// Setup your Middleware and API Router here
require("dotenv").config()
const express = require("express")
const app = express()


const client = require('./db/client');
client.connect();


const morgan = require('morgan');
app.use(morgan('dev'));

const bodyParser = require('body-parser');
app.use(bodyParser.json())

const cors = require('cors');
app.use(cors({
    origin: "*",
}))

app.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");
  
    next();
});


const apiRouter = require('./api');
app.use('/api', apiRouter);


module.exports = app;
