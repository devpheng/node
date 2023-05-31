import express, { Request, Response }  from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt, { compareSync } from 'bcrypt';

const prisma = new PrismaClient();

export const login = async (req: any, res: any) => {
    try {
        const { username, password } = req.body;
        const cookies = req.cookies;

        if(!username || !password) {
            return res.status(400).json({ 'message': 'Username and password are required.' });
        }

        const user = await prisma.user.findFirst({
            where: {
                username
            },
            include: {
                tokens: true
            }
        });

        if(!user) return res.sendStatus(401); //Unauthorized

        const hash: string = user.password as string;
        if(bcrypt.compareSync(password, hash)) {
            const jwtTokenkey: string = process.env.JWT_TOKEN_KEY as string;
            const jwtRefreshTokenkey: string = process.env.JWT_REFRESH_TOKEN_KEY as string;
            // Generate an access token
            const accessToken = jwt.sign({
                                        id: user.id,
                                        username: user.username,
                                        role: user.role 
                                    }, 
                                    jwtTokenkey,
                                    { expiresIn: '10s' }
                                );
            const accessRefreshToken: any = jwt.sign({
                                            id: user.id,
                                            username: user.username,
                                            role: user.role
                                        }, 
                                        jwtRefreshTokenkey,
                                        { expiresIn: '1d' }
                                );

            if (cookies?.jwt) {
                /* 
                Scenario added here: 
                    1) User logs in but never uses RT and does not logout 
                    2) RT is stolen
                    3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
                */
                const refreshToken = cookies.jwt;
                const foundToken = await prisma.refreshToken.findFirst({
                                        where: {
                                            token: refreshToken,
                                        }
                                    });
    
                // Detected refresh token reuse!
                if (foundToken == null) {
                    console.log('attempted refresh token reuse at login!')
                    // clear out ALL previous refresh tokens
                    await prisma.refreshToken.deleteMany({
                        where: {
                            authorId: user.id,
                        },
                    });
                }

                await prisma.refreshToken.deleteMany({
                    where: {
                        token: refreshToken,
                    },
                });
    
                res.clearCookie('jwt', { httpOnly: true, sameSite: "None", secure: true });
            }

            await prisma.refreshToken.create({
                data: {
                    token: accessRefreshToken,
                    authorId: user.id
                }
            });

            // Creates Secure Cookie with refresh token
            res.cookie('jwt', accessRefreshToken, { httpOnly: true, secure: true, sameSite: "None", maxAge: 24 * 60 * 60 * 1000 });

            // Send authorization roles and access token to user
            res.json({ accessToken });

        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const refreshToken = async (req: express.Request, res: express.Response) => {
    try {
        const cookies = req.cookies;
        if(!cookies?.jwt) return res.sendStatus(401);
        const refreshToken = cookies.jwt;
        res.clearCookie('jwt', { httpOnly: true, sameSite: false, secure: true });

        const foundToken = await prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
            }
        });

        const jwtRefreshTokenkey: string = process.env.JWT_REFRESH_TOKEN_KEY as string;
        const jwtTokenkey: string = process.env.JWT_TOKEN_KEY as string;

        if (foundToken == null) {
            jwt.verify(
                refreshToken,
                jwtRefreshTokenkey,
                async (err: any, user: any) => {
                    if (err) return res.sendStatus(403); //Forbidden
                    console.log('attempted refresh token reuse!')
                   
                    await prisma.refreshToken.deleteMany({
                        where: {
                            authorId: user.id,
                        },
                    });
                }
            );
            return res.sendStatus(403); //Forbidden
        }

        // evaluate jwt 
        jwt.verify(
            refreshToken,
            jwtRefreshTokenkey,
            async (err: any, user: any) => {
                if (err) {
                    console.log('expired refresh token')
                    await prisma.refreshToken.deleteMany({
                        where: {
                            token: refreshToken,
                        },
                    });
                }

                const foundUser = await prisma.user.findFirst({
                    where: {
                        username: user.username
                    },
                    include: {
                        tokens: true
                    }
                }); 
        
                if (err || foundUser == null || foundUser.username !== user.username) return res.sendStatus(403);

                const accessToken = jwt.sign({
                        id: user.id,
                        username: user.username,
                        role: user.role 
                    },
                    jwtTokenkey,
                    { expiresIn: '10s' }
                );

                const newRefreshToken = jwt.sign({
                        id: user.id,
                        username: user.username,
                        role: user.role
                    },
                    jwtRefreshTokenkey,
                    { expiresIn: '1d' }
                );
                // Saving refreshToken with current user
                await prisma.refreshToken.create({
                    data: {
                        token: newRefreshToken,
                        authorId: user.id
                    }
                });

                // Creates Secure Cookie with refresh token
                res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: false, maxAge: 24 * 60 * 60 * 1000 });

                res.json({ accessToken })
            }
        );

    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const logout = async (req: express.Request, res: express.Response) => {
    try {
        const cookies = req.cookies;
        if(!cookies?.jwt) return res.sendStatus(204); //No Content
        const refreshToken = cookies.jwt;

        const foundToken = await prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
            }
        });

        // Detected refresh token reuse!
        if (foundToken == null) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: false, secure: true });
            return res.sendStatus(204);
        }

        await prisma.refreshToken.deleteMany({
            where: {
                token: refreshToken,
            },
        });

        res.clearCookie('jwt', { httpOnly: true, sameSite: false, secure: true });
        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};