import { Router } from "express";
import * as controllers from '../../controllers/users.controller'
import {auth,notAuth} from '../../middleWares/auth.middleWare';

const router =  Router();


router.route('/login')
    .post(notAuth, controllers.signIn)
    // .delete(authenticate, controllers.signOut);

router.route('/signUp').post(notAuth, controllers.signUp);


export default router;