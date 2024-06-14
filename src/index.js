import dotenv from 'dotenv'
import app from './app.js'
import connectDB from './db/indexdb.js'

dotenv.config({
    path: './.env'
})

const port = process.env.PORT;

connectDB()
.then(() => {
    app.listen(port || 3000, () => {
        console.log(`Listenng on Port : ${port}`);
    })

    app.on("error", (error) => {
        console.log("Error: ", error);
        throw error;
    })
})
.catch((error) => {
    console.log("MongoDB error:", error);
    process.exit(1)
})