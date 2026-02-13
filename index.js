const express = require('express');
require("dotenv").config();
const mongoose = require('mongoose');
const path = require('path');
const nocache = require('nocache');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');

const userRoute = require('./router/userRout');
const adminRoute = require('./router/adminRout');

const app = express();   // ✅ THIS IS THE REAL APP

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

// Middleware
app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.use(session({
    secret: process.env.sessionSecret,   // match your .env
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', userRoute);
app.use('/admin', adminRoute);

// Server
const port=process.env.port || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
