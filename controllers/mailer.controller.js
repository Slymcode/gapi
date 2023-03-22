const nodemailer =  require('nodemailer')
const aws = require("@aws-sdk/client-ses");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");


const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
  defaultProvider,
});

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

exports.sendMail = async (params ) => 
{
    const recipient = params.email;
    const subject = params.subject;
    const message = params.message;
    
    const mailOptions = {
      from: "no-reply@getgreenlit.xyz",
      to: recipient,
      subject: subject,
      html: message
    };
    
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions).then(data => {
          resolve({status: true, message: 'Email sent successfully'});
        }).catch(error => {
          reject({status: false, message: error.message || "Could not send email. Try again"});
      });
    });
}




