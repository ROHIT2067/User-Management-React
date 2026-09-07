
import mongoose from 'mongoose';
const connectDB=async()=>{
try{
    const mongoPort = process.env.MONGO_URI;
    await mongoose.connect(mongoPort);
    console.log("port connected")
}catch(error){
    console.log(error,"data base error");
    process.exit(1)
}
}

export default connectDB;