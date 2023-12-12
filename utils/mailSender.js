const nodemailer = require("nodemailer");
require("dotenv").config();


//this is just the mechanism of OPT sending not pre post its in main fn
const mailSender = async(email,title,body) => {
    try{


        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
               user: process.env.MAIL_USER, //mailt from which we send mailto user
               pass: process.env.MAIL_PASS,
           },
        });

        let info = await transporter.sendMail({
            from:`XYZ`,
             to: `${email}`,
            subject: "${title}",
            html: `${body}`
         });

         console.log(info);
         return info;

    }
    catch(error){
        console.log(error.message);
    }
}
 
module.exports = mailSender;
