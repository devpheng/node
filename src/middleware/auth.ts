
import express, { Request, Response }  from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: any, res: express.Response, next: any) => {
    const authHeader = req.headers.authorization;
    const accessTokenSecret: string = process.env.JWT_TOKEN_KEY as string;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err: any, user: any) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}