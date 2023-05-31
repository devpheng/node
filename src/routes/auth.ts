import express, { Request, Response }  from 'express';
import { login, refreshToken, logout } from '../controllers/auth';
import { authenticateJWT } from '../middleware/auth'

export default (router: express.Router ) => {
    router.post('/login', login);
    router.post('/token', refreshToken);
    router.post('/logout', logout);
};