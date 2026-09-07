import  mongoose ,{Schema} from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type:String,
    required:true
    },
    password:{
        type:String,
        required:true
    },
     email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
   isAdmin: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  createdAt:{
    type:Date,
    default:Date.now()
  }
})
export default mongoose.model("User",userSchema)