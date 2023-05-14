import express, { Request, Response }  from 'express';

// import authentication from './authentication';
import users from './users';

const router = express.Router();

export default (): express.Router => {
//   authentication(router);
    users(router);
    router.get('/', function(req: Request , res: Response){
        res.send("Hello world!");
    });

    return router;
};