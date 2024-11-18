// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is Running on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo DB connect Fail : ", err);
  });

// import express from "express";
// const app = express()
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("errror", (error) => {
//       console.log("Not able to Express : ",error);
//       throw error;
//     });

//     app.listen(process.env.PORT,()=>{
//         console.log(`App is listining on port ${process.env.PORT}`)
//     })

//   } catch (error) {
//     console.error("Error : ", error);
//     throw err;
//   }
// })();
