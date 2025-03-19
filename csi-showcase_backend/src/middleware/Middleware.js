// secretKeyMiddleware.js
export const checkSecretKey = (req, res, next) => {
    const secretKey = req.headers['secret_key'];
  
    // Check if the secret key is present and valid
    if (secretKey && secretKey === process.env.SECRET_KEY) {
      return next(); // Proceed to the next middleware or route handler
    }
  
    return res.status(403).json({ message: 'Forbidden: Invalid or missing secret key' });
  };
  