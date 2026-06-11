import express from 'express'
import { userAuthMiddleware } from '../middlewares/authMiddleware';


const router = express.Router();
//for multiple products--->>to get all the products for the user and for the admin to update and create Products on the app 
router.route('/').get(getProducts).post(userAuthMiddleware,admin,createProduct);

//for singular products

router.route('/:id').get(getProductById).put(userAuthMiddleware,admin,updateProduct).delete(userAuthMiddleware,admin,deleteProduct);


export default router;