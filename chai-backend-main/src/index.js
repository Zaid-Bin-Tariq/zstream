import { app } from "./app.js";
import connectDB from "./db/index.js";
import { PORT } from '../env.js';




connectDB()
.then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
})
.catch((err) => {
    console.log("Mongodb connection error", err)
})