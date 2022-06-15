require('dotenv').config();

const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const AccountRouter = require('./controller/AccountRouter');
const AdminRouter = require('./controller/AdminRouter');
const UserRouter = require('./controller/UserRouter');
const session = require('express-session');
const app = express();

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: 'mySecret', resave: false, saveUninitialized: false }));
app.use('/', AccountRouter);
app.use('/admin', AdminRouter);
app.use('/user', UserRouter);


//connect moongose and server
const port = process.env.PORT || 8080;
mongoose.connect('mongodb://localhost/vidientu', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(port, () => console.log('http://localhost:' + port));
}).catch(err => console.log('Connect fail: ' + err.message));