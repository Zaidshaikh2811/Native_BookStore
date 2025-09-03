import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookRoute from "./routes/bookRoute.js";
import {connectDB} from "./lib/db.js";
import job from "./lib/cron.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
job.start();

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
    console.log("Root route accessed");
    res.status(200).json({
        status: "success",
        message: "Welcome to the API",
        timestamp: new Date().toISOString()
    });
});


app.use("/api/v1/user",userRoutes)
app.use("/api/v1/admin",adminRoutes)
app.use("/api/v1/books",bookRoute)



app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        status: "error",
        message: `Route ${req.originalUrl} not found`
    });
});


app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${process.env.API_URL}`);
    connectDB().then(async () => {
        console.log("Connected");
    });
});