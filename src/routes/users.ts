import express, { Request, Response }  from 'express';
import { getUsers, registerUser } from '../controllers/users';
import { authenticateJWT } from '../middleware/auth'

export default (router: express.Router ) => {
    router.get('/user', authenticateJWT, getUsers);
    router.post('/user', registerUser);
};