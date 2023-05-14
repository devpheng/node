import express, { Express, Request, Response } from 'express';
import route from './routes';
const app: Express = express();


const port = process.env.PORT || 8005;

app.listen(port, function(){
    console.log('Sample mySQL app listening on port ' + port);
});

app.use('/', route());