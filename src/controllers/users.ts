import express, { Request, Response }  from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await prisma.user.findMany()
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const registerUser = async (req: any, res: express.Response) => {
    try {
        const { username, password, email, role } = req.body;
        if (!username || !password) return res.status(400).json({ 'message': 'Username and password are required.' });

        const existUser = await prisma.user.findFirst({
            where: {
                username
            }
        });

        if(existUser) {
            return res.sendStatus(409);
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const user = await prisma.user.create({
            data: {
                email,
                password: hash,
                username,
                role
            }
        });

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};