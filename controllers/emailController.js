const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// These id's and secrets should come from .env file.
const CLIENT_ID = '210587713914-updmumn4iq06ghgsofs2v2134ub2lso6.apps.googleusercontent.com';
const CLEINT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04VXWV5Rr0-4zCgYIARAAGAQSNwF-L9IroHv7fPaV1jI2FyjGH84Y8P34ukvoUBPtqr0MBIPdl99td2PIj5-Htmsq-Hh22DE-ZNc';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

exports.sendMail =async (req,res)=> {
    try {
        await email();
        res.status(200).send('Email sent successfully');
        return result;
      } catch (error) {
        return error;
      }
}

exports.email =async (mailOptions="")=> {
    const accessToken = await oAuth2Client.getAccessToken();
    
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'minicoders.help@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

     mailOptions =  mailOptions ? mailOptions :  {
      from: 'Mini-Coders <yours authorised email minicoders.help@gmail.com>',
      to: 'ayush.sharma617@gmail.com',
      subject: 'Hello from gmail using API',
      text: 'Hello from gmail email using API',
      html: '<h1>Hello from gmail email using API</h1>',
    };

    const result = await transport.sendMail(mailOptions);
}