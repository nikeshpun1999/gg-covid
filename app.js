const express = require('express');
const mongoose = require('mongoose');
const app = express();

const cors = require('cors');

require('dotenv/config');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const userRoute = require('./api/routes/userapi');
const dashuserRoute = require('./dashboard/routes/dashuserapi');
const dashboardRoute = require('./dashboard/routes/dashboard');
const helplineRoute = require('./api/routes/helpline');
const panicRoute = require('./api/routes/panic');
const questionRoute = require('./dashboard/routes/question');
const photovideoRoute = require('./dashboard/routes/photovideoapi');
const donationRoute = require('./api/routes/donation');
const usageRoute = require('./api/routes/usage');
const checkupRoute = require('./api/routes/checkupapi');


app.use('/user', userRoute);
app.use('/checkup', checkupRoute);

app.use('/dashboard/user', dashuserRoute);
app.use('/dashboard/data', dashboardRoute);
app.use('/helpline', helplineRoute);
app.use('/panic', panicRoute);
app.use('/dashboard/question', questionRoute);
app.use('/dashboard/photovideo', photovideoRoute);
app.use('/donation', donationRoute);
app.use('/usage', usageRoute);

mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('DB Connection Successfull'))
    .catch((err) => {
        console.error(err);
    });

app.listen(8000);