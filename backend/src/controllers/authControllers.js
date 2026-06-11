import {prisma} from "../config/db.js"
import bcrypt from 'bcryptjs'
import {sendRegistrationWelcomeEmail} from '../services/email.js'
import {generateOTP} from '../utils/otp.js'
import {sendOTPEmail} from '../services/email.js'
import { generateRefreshToken } from '../utils/tokenGenaration.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'



export const UserRegistration = async (req,res)=>{
    const {name,email,password} = req.body;
    const userExits = await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(userExits){
        return res.status(401).json({
            message:"user already exists"
        })
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    const user = await prisma.user.create({
        data:{
            name,
            email,
            password:hashedPassword
        }
    })

   
    const otp = generateOTP();
    sendOTPEmail(user.email,user.name,otp);

    const  hasshedOpt = crypto.createHash('sha256').update(otp).digest('hex');

    const otpData = await prisma.otp.create({
        data:{
            userId:user.id,
            code:hasshedOpt,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        }
    })

    return res.status(201).json({
            success: true,
            message: "User registered successfully! Please check your email for the OTP.",
            userId: user.id
        });




    // if(user.verified===false){
    //     return res.status(400).json({
    //         message:"user not verified."
    //     })
    // }
     

        

}

export const OptVerification = async (req,res)=>{
    const {otp} = req.body;
     const hasshedOpt = crypto.createHash('sha256').update(otp).digest('hex');

    const findOtp = await prisma.otp.findUnique({
        where:{
            code:hasshedOpt
        }
    })

    if(!findOtp){
        return res.status(401).json({
            message:"Invalid OTP"
        })
    }
    if(Date.now() > findOtp.expiresAt){
        return res.status(401).json({
            message:"OTP expired"
        })
    }
        await prisma.user.update({
        where:{
            id:findOtp.userId
        },
        data:{
            verified:true
        }
    })

    const user = await prisma.user.findUnique({
        where:{
            id:findOtp.userId
        }
    })
    if(!user){
        return res.status(401).json({
            message:"user not found"
        })
    }


    const refreshToken =await generateRefreshToken(user.id,res);
        const hasshedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
            const sessionExpiryDate = new Date();
            sessionExpiryDate.setDate(sessionExpiryDate.getDate() + 60);
             await prisma.session.create({
            data:{
                userId:user.id,
                sessionToken:hasshedRefreshToken,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                expiresAt:sessionExpiryDate
            }
        })
         const accessToken = jwt.sign({id:user.id,sessionToken:hasshedRefreshToken},process.env.JWT_ACESS_SECRET,{
            expiresIn:"10m"
        });

        res.status(200).json({
            message:"user registered successfully",
            data:{
            accessToken,
            id:user.id,
            name:user.name,
            email:user.email,
            }
        })


    await prisma.otp.delete({
        where:{
            id:findOtp.id
        }
    }) 
}

export const otpExpired = async (req,res)=>{
    const {userId} = req.body;
    const user = await prisma.user.findUnique({
        where:{
            id:userId
        }
    })

    const otp = generateOTP();
    sendOTPEmail(user.email,user.name,otp);
    const hasshedOpt =  crypto.createHash('sha256').update(otp).digest('hex');

    await prisma.otp.deleteMany({
        where:{
            userId:user.id
        }
    })
    await prisma.otp.create({
        data:{
            userId:user.id,
            code:hasshedOpt,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        }
    })

    res.status(200).json({
        message:"OTP sent successfully"
    })

    
}


export const login = async (req,res)=>{
    const {email,password} = req.body;
    const user = await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(!user){
        return res.status(401).json({
            message:"Invalid Email or Password"
        })
    }
    if(user.verified === false){
        return res.status(401).json({
            message:"user not verified Please verify the email first."
        })
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(401).json({
            message:"Invalid Email or Password"
        
        })
    }

    const refreshToken = generateRefreshToken(user.id,res);
    const hasshedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    

         await prisma.session.create({
         data:{
                userId:user.id,
                sessionToken:hasshedRefreshToken,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                expiresAt:'60d'
            }
    })

    const accessToken = jwt.sign({id:user.id,sessionToken:hasshedRefreshToken},process.env.JWT_ACESS_SECRET,{
        expiresIn:"10m"
    })

    res.status(200).json({
        message:"user logged in successfully",
        data:{
        accessToken,
      id:user.id,
      name:user.name,
      email:user.email,
        },
        accessToken:accessToken
    })      
}


export const accessToken = async (req,res)=>{
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json({
            message:"Unauthorized No refresh token."
        })
    }
    const verifyRefreshToken = jwt.verify(refreshToken,process.env.JWT_SECRET);

    if(!verifyRefreshToken){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
    const user = await prisma.user.findUnique({
        where:{
            id:verifyRefreshToken.id
        }
    })

    const newRefreshToken = generateRefreshToken(user.id,res);
    const hasshedNewRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    await prisma.session.update({
        where:{
            userId:user.id
        },
        data:{
            sessionToken:hasshedNewRefreshToken
        }
    })


    const accessToken = jwt.sign({id:user.id,sessionToken:hasshedNewRefreshToken},process.env.JWT_ACESS_SECRET,{
        expiresIn:"10m"
    })

    res.status(200).json({
        message:"access token sucessfully generated",
        data:{
            accessToken
        }
    })
      
}


export const logout = async (req,res)=>{
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json({
            message:"Unauthorized No refresh token."
        })
    }
      const userExits = jwt.verify(refreshToken,process.env.JWT_SECRET);
        if(!userExits){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }
        hasshedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');


        await prisma.session.update({
        where:{
            userId:userExits.id,
            sessionToken:hasshedRefreshToken
        },
        data:{
            revoked:true
        }
    })
    res.clearCookie('refreshToken');

    res.status(200).json({
        message:"user logged out successfully"
    })


   
    
}