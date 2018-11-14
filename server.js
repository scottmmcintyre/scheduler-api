const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const shifts = require("./routes/api/shifts");
const users = require('./routes/api/users');

const app = express();

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

// Use the passport middleware
app.use(passport.initialize());

// Load passport Config
require('./config/passport')(passport);

// Use Routes
app.use('/api/shifts', shifts);
app.use('/api/users', users);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port: ${port}`));