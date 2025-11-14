const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

const sendIssueStatusUpdate = async (userEmail, userName, issueTitle, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `Issue Status Updated - ${issueTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Issue Status Update</h2>
          <p>Hello ${userName},</p>
          <p>The status of your issue "<strong>${issueTitle}</strong>" has been updated.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Previous Status:</strong> ${oldStatus}</p>
            <p><strong>New Status:</strong> ${newStatus}</p>
          </div>
          <p>Thank you for using Civic Issue Tracker!</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

const sendNewCommentNotification = async (userEmail, userName, issueTitle, commenterName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `New Comment on Your Issue - ${issueTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Comment on Your Issue</h2>
          <p>Hello ${userName},</p>
          <p><strong>${commenterName}</strong> has commented on your issue "<strong>${issueTitle}</strong>".</p>
          <p>Login to the Civic Issue Tracker to view the comment and respond.</p>
          <p>Thank you for using Civic Issue Tracker!</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Comment notification email sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = {
  sendIssueStatusUpdate,
  sendNewCommentNotification
};