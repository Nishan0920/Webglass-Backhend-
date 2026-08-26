import mongoose from "mongoose";
const fillStaff = new mongoose.Schema({
  StaffName: {
    type: String,
    required: true,
  },
  Designation: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: String,
    required: true,
    unique: true,
    min: 10,
    max: 10,
    matches: /^\d{10}$/,
  },
  Email :  {},
  JoinDate : {
     type : Date
  }
},{
    timestamps : true
});
const Staff = mongoose.model("staffinfo",fillStaff)
export default Staff