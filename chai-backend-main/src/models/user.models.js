import mongoose, {Schema} from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET } from '../../env.js'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary / aws URL
        required: true
    },
    coverImage: {
        type: String // cloudinary / aws URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    },
}, 
{timestamps: true})

// always use classic functions inside Mongoose Hooks / Middleware
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
    // short live access token - max 1 day
    return jwt.sign({
        _id: this._id, // usually only id is stored
        email: this.email,
        username: this.username,
        fullname: this.fullname
    }, ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken = async function () {
    // 1 day - 1 month
    return jwt.sign({
        _id: this._id, // paylaod for refresh_token always contain only one information (i.e. id)
    }, REFRESH_TOKEN_SECRET, {expiresIn: REFRESH_TOKEN_EXPIRY})
}

export const User = mongoose.model("User", userSchema)