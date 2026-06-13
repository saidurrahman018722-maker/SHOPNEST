import {prisma} from "../config/db.js"
import fs  from "fs";
import { uploadOnCloudinary } from "../services/cloudinaryServices.js";



export const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        
        return res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: req.params.id,
            
            },
        });

        if( product){
            res.status(200).json(product);
        }
        else{
            res.status(404).json({message:"product not found"});
        
        }
    }
    catch (error) {
        console.error("Error fetching product",error);
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        let imageUrl = '';

        // 1. Look for .buffer instead of .path
        const fileBuffer = req.file?.buffer; 
        
        if (!fileBuffer) {
            return res.status(400).json({
                message: "No media provided."
            });
        }

        console.log("--- DEBUGGING RAM UPLOAD ---");
        console.log("Did Multer give us a buffer in RAM?", !!req.file.buffer);
        console.log("----------------------------");

        // 2. Pass the buffer directly to Cloudinary
        const upload = await uploadOnCloudinary(fileBuffer);

        if (!upload) {
             return res.status(500).json({ message: "Failed to upload to Cloudinary" });
        }

        imageUrl = upload.secure_url;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                category,
                stock: Number(stock),
                imageUrl
            },
        });
        
        res.status(201).json(product);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

    export const updateProduct = async (req, res) => {
        const {name, description, price,catagory, stock} = req.body;
        try{
        const product = await prisma.product.findUnique({
            id:req.params.id
        })

        if(!product){
            return res.status(404).json({
                message:"product not found"
            })
        }
        let imageUrl = product.imageUrl;

         if(req.file?.path){
            const filePath = req.file.path;
            const upload = await uploadOnCloudinary(filePath);
            imageUrl = upload.secure_url;
        }
        const updatedProduct = await prisma.product.update({
            where:{
                id:req.params.id
            },
            data:{
                name: name  || product.name,
                description : description || product.description,
                price : Number(price) || product.price,
                catagory : catagory || product.catagory,
                stock : Number(stock) || product.stock,
                imageUrl: imageUrl
            }
        }) 
        res.status(200).json(updatedProduct);
    }
    catch(error){
        return res.status(400).json(error.message);
    }

    }

    export const deleteProduct = async (req, res) => {
         await prisma.product.delete({
            where:{
                id:req.params.id
            }
        })
        res.status(200).json({
            message:"product deleted successfully"
        })

    }