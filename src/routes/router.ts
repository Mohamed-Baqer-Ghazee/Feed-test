import { Router } from "express";
import usersRoutes from "./api/users.routes"

const router =  Router();

router.use("/users",usersRoutes);

export default router;