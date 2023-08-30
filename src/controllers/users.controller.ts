import UserModel from "../models/user.model";
import express, { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken"
import bodyParser from "body-parser"
import { z } from "zod"
import { fromZodError } from "zod-validation-error";

const app = express();
const userModel = new UserModel();
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));

const userSignUp = z.object({
    username: z
        .string()
        .min(6, { message: "username must be 6 or more characters long" })
        .max(16, { message: "username must be 16 or fewer characters long" }),
    email: z
        .string()
        .email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: 'Password must be 8 characters minimum' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one capital letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});

type userUp = z.infer<typeof userSignUp>;

const userSignIn = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: 'Password must be 8 characters minimum' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one capital letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});

type userIn = z.infer<typeof userSignIn>;
export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;
        const userData: userUp = {
            username,
            email,
            password
        }
        const isValid = userSignUp.safeParse(userData);
        if (!isValid.success) {

            console.log(fromZodError(isValid.error).message);
            res.send(fromZodError(isValid.error).message);
            return;
        }
    // Try to sign up the user.
    const newUser = await userModel.signUp(username, email, password);

    const secretKey: Secret = process.env.TOKEN_SECRET as Secret;
    const token = jwt.sign({ userId: newUser.id }, secretKey);
    res.json({ token ,status: 'success', message: 'Signup complete' });

    } catch (error) {
        const err = new Error(`Unable to create (${(error as Error).message})`);
        err.name = "user already exists";
        next(err);
    }
};

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const userData: userIn = {
            email,
            password
        }
        const isValid = userSignIn.safeParse(userData);
        if (!isValid.success) {
            res.status(400).send(fromZodError(isValid.error).message);
            return;
        }

        const userFound  = await userModel.signIn(email, password);
        if (!userFound ) {
            res.status(401).json({ error: 'Invalid credentials' });
        } else {
            const secretKey: Secret = process.env.TOKEN_SECRET as Secret;
            const token = jwt.sign({ userId: userFound .id }, secretKey);
            res.json({ token });
        }
    } catch (error) {
        next(error)
    }
}


// const maxAge = 30 * 24 * 60 * 60;
// function sendToken(res: Response, user: any) {
//     const token = jwt.sign({ user }, process.env.token_secret as unknown as string, { expiresIn: maxAge });
//     res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
//     res.redirect("/");

// }


// function getUserId(req: Request, next: NextFunction) {

//     const token = req.cookies.jwt;
//     if (token) {
//         try {
//             const decodedToken = jwt.verify(token, process.env.token_secret as unknown as string) as JwtPayload;
//             return decodedToken.user.id;
//         } catch (error) {
//             next(error)
//         }
//     } else {
//         return 0;

//     }
// }