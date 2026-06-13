import express from "express"

const router = express.Router();


router.route('/').post(createOrder).get(allOrders) //the allOrders in the admin route
router.route('/myOrders').get(getOrderById)
router.route('/:id').put(updateOrderStatus) // the updateOrderStatus is for the admin controller




export default router;