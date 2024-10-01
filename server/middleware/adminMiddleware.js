const adminMiddleware = (req, res, next) => {
    if(req.user.role !== 'admin') {
        return res.status(403).json({msg : 'Access denied. Admins Only'})
    }
    next();
}

export default adminMiddleware;