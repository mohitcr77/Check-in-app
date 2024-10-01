const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err.message);
    
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
    });
  };
  
  export default errorMiddleware;
  