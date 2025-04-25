import jwt from "jsonwebtoken"


export const protectRoute = (req, res, next) => {
    const accessToken = req.cookies.accessToken
    if(!accessToken) return res.status(401).json({ success: false, error: "Unauthorized - no token provided" })
    try {
       const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
       
       if(!decoded) return res.status(403).json({ success: false, error: "Forbidden - invalid token provided" })

       req.userId = decoded.userId 
       next()
    } catch (error) {
        console.log("Error in protectRoute function", error);
        
    }

}