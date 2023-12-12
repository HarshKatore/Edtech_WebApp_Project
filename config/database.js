const mongoose = require('mongoose');
require("dotenv").config();
 
exports.connect = () =>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true

    }) 
    .then(console.log("DB Connected Sucessfullly"))
    .catch((error)=>{
        console.log("DB Connection Failed");
        console.log(error);
        process.exit(1);   //unexppected terminate
    })
};

//exports.connect -> database.connect();
//exports.module = connect; -> connect();