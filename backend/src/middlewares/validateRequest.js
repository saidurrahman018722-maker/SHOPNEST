export const validateRequest = (schema) => {
  return (req, res, next) => {
    // 1. Parse the body safely
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // 2. Extract the actual error messages cleanly
      const errorMessages = result.error.issues.map((issue) => issue.message);
      
      // 3. Print the REAL error to your terminal so you can read it!
      console.log("Zod Blocked the Request. Reason:", errorMessages);

      // 4. Send the real error to Postman
      return res.status(400).json({
        status: "Failed",
        message: "Validation failed: " + errorMessages.join(", ")
      });
    }

    // 5. Override req.body with the clean, validated data (applies your defaults!)
    req.body = result.data;
    
    next();
  };
};