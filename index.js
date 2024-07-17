const express = require('express');
const app = express()
const path = require('path')
const nocache=require('nocache')

app.use(nocache())

require('dotenv').config()

const  mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/eCommerce")
const session = require('express-session')        
const userRoute= require('./router/userRout')
const adminRoute= require('./router/adminRout');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('views','view')

// const sessionSecret='mySiteSessionSectet';
// app.use('/static',express.static(path.join(__dirname,'public')))
// app.use('/static',express.static(path.join(__dirname,'public','assets')));


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const publicPath = path.join(__dirname, 'public');

   
app.use(express.static(publicPath));


app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
}))

// app.use((req.))
app.use('/', userRoute);
app.use('/admin',adminRoute)   





app.listen(3000, () => {
    console.log('server starting')
})

