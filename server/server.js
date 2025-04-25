import dotenv from "dotenv"
import express from "express"
import { connectDB } from "./db/connedtDB.js"
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import path from "path"


dotenv.config()
const PORT = process.env.PORT || 5000


const app = express()
const __dirname = path.resolve()


app.use(express.json()) // allow us to parse incoming request: req.body
app.use(cookieParser())



app.use("/api/auth", authRoutes)

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/client/dist")))

    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
    })
}


app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`);
    
})