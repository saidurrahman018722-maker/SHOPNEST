import { sendOrderConfirmationEmail } from "../services/email";



export const createOrder = async (req,res)=>{
    const {totalAmount,paymentId,address,items} = req.body;

    try{
    const order = await prisma.order.create({
      data: {
        userId: req.user.id, 
        totalAmount,
        paymentId,
        // Flatten the address for the relational database
        addressFullName: address.fullName,
        addressStreet: address.street,
        addressCity: address.city,
        addressPostalCode: address.postalCode,
        addressCountry: address.country,

        // Create the related items
        items: {
          create: validatedData.items.map(item => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price
          }))
        }
      },
      include: { items: true } // Return the items in the response
    });

    // 4. Send the Email (See "How to Manage It" below for why we don't 'await' this)
   sendOrderConfirmationEmail(user.email, user.name, order.id, totalAmount);

    // 5. Send Response
    return res.status(201).json({ 
      message: 'Order created successfully', 
      order 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('[CREATE_ORDER_ERROR]:', error);
    return res.status(500).json({ message: 'Error creating order', error });
  }
};
}