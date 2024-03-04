const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

dotenv.config({path:"./config/config.env"});

connectDB();

const app=express();

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express Campground API'
        },
        servers: [
            {
                url: 'http://localhost:5000/api-informations'
            }
        ],
    },
    apis:['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(express.json());

app.use(xss());

app.use(helmet());

app.use(mongoSanitize());

app.use(cookieParser());

const limiter = rateLimit({
    windowsMs:10*60*1000,
    max: 100
});
app.use(limiter);

app.use(hpp());

app.use(cors());

const campgrounds = require('./routes/campgrounds');
const users = require('./routes/users');
const reservations = require('./routes/reservations');

app.use('/api-informations/campgrounds', campgrounds);
app.use('/api-informations/users', users);
app.use('/api-informations/reservations', reservations);

const PORT=process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection',(err,promise)=> {
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
})