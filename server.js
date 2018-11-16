const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const shifts = require("./routes/api/shifts");
const users = require('./routes/api/users');

const app = express();

app.use(express.static('/public'));

// Write a general swagger definition for swaggerJSDoc
var swaggerDefinition = {
    info: {
      title: 'Scheduler API',
      version: '1.0.0',
      description: 'Code Challege for Scheduler API',
    },
    securityDefinitions: {
        JWT: {
          type: 'apiKey',
          description: 'JWT authorization of an API',
          name: 'Authorization',
          in: 'header',
        }
    },
    host: 'localhost:5000',
    basePath: '/',
};

// options for the swagger docs
var options = {
swaggerDefinition: swaggerDefinition,
apis: ['./**/routes/api/*.js','routes.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB through Mongoose
mongoose
    .connect(db, { useNewUrlParser: true})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

mongoose.set('useFindAndModify', false);

// Use the passport middleware
app.use(passport.initialize());

// Load passport Config
require('./config/passport')(passport);

// serve swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use Routes
app.use('/api/shifts', shifts);
app.use('/api/users', users);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port: ${port}`));