import express from 'express'
//import { userAuthMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/multerMiddleware.js';
//import { admin } from '../middlewares/adminMiddleware.js';
import { getProducts,getProductById } from '../controllers/productController.js';
import { createProduct,updateProduct,deleteProduct } from '../controllers/productController.js';


const router = express.Router();
//for multiple products--->>to get all the products for the user and for the admin to update and create Products on the app 
router.route('/').get(getProducts).post(upload.single('image'),createProduct);

//for singular products
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct);


export default router;