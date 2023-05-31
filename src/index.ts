import express, { Express, Request, Response } from 'express';
import route from './routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const app: Express = express();

app.use(bodyParser.json());

//middleware for cookies
app.use(cookieParser());

const port = process.env.PORT || 8005;

app.listen(port, function(){
    console.log('Sample mySQL app listening on port ' + port);
});

app.use('/', route());