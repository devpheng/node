import express, { Request, Response }  from 'express';
import user from '../models/user';

export const getUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await user.get_all();
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};