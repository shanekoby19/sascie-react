const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        port: process.env.SENDGRID_PORT,
        auth: {
            user: process.env.SENDGRID_USERNAME,
            pass: process.env.SENDGRID_PASSWORD
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Shane Kobylecky <skobylecky1@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // 3) Send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;