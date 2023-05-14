import express, { Request, Response }  from 'express';
import { getUsers } from '../controllers/users';

export default (router: express.Router ) => {
    router.get('/user', getUsers);
};