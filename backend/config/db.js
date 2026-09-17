
import mongoose from 'mongoose';
import env from './env.js';

const connectDB=async()=>{
try{
    await mongoose.connect(env.MONGO_URI);
    console.log("port connected")
}catch(error){
    console.log(error,"data base error");
    process.exit(1)
}
}

export default connectDB;
