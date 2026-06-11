import express from 'express'
import {UserRegistration,login,logout,accessToken,OptVerification,otpExpired} from '../controllers/authControllers.js'



const router = express.Router();


router.post('/register',UserRegistration);
router.post('/login',login);
router.patch('/refresh-token',accessToken);
router.post('/opt-verification',OptVerification);
router.post('/otp-expired',otpExpired);
router.post('/logout',logout);


export default router;


