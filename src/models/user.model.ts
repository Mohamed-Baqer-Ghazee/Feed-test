import express, { Router, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'

const prisma = new PrismaClient();

const hashPassword = (password: string) => {
    const salt = parseInt(process.env.SALT as string, 10);
    return bcrypt.hashSync(`${password}${process.env.BCRYPT_PASSWORD}`, salt)
}

class UserModel {

    async signUp(username: string,email: string, password: string) {

        try {
            const user = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashPassword(password),
                },
            });
            return user;
        } catch (error) {
            console.log("model error");
            
            throw new Error(`Unable to create (${username}: ${(error as Error).message})`);
        }
    }
    async signIn(email: string, password: string) {

        try {
            
            const user = await prisma.user.findUnique({
                where: {
                    email
                },
            });
            if (user) {
                const { password: hashPassword} = user;
                const isPassword = bcrypt.compareSync(
                    `${password}${process.env.bcrypt_password}`,
                    hashPassword as string
                )
                if (isPassword) {
                    return user;
                }
            }

            return null;

        } catch (error) {
            throw new Error(`Unable to login: ${(error as Error).message}`);
        }
    }
}


export default UserModel;