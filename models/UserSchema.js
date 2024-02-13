const mongose = require('mongoose')
const UserSchema = new mongose.Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: "",
    },
    mobile: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    status: {
        type: Number,
        default: 1,//1=Active,0=Inactive,-1=deleted
    }
}, { timestamps: true })
module.exports = mongose.model("m_users", UserSchema)