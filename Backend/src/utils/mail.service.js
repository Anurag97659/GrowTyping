import nodemailer from "nodemailer";

const hasSmtpConfig =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_PORT) &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASS) &&
    Boolean(process.env.MAIL_FROM);

let transporter = null;

if(hasSmtpConfig){
    console.log("SMTP Config found:", {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
        from: process.env.MAIL_FROM,
    });
    
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        connectionTimeout: 20000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        auth:{
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    transporter.verify((error) => {
        if (error) {
            console.error("SMTP verify failed", {
                message: error?.message,
                code: error?.code,
                command: error?.command,
                responseCode: error?.responseCode,
                response: error?.response,
            });
            return;
        }
        console.log("SMTP transporter verified successfully");
    });
} else {
    console.log("SMTP Config missing - email will not be sent");
}

const sendVerificationMail = async({ to, username, verificationUrl }) =>{
    if(!transporter){
        console.log("SMTP config missing. Verification URL:", verificationUrl);
        return;
    }

    try {
        console.log("Sending verification email to:", to);
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject: "Verify your GrowTyping account",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
                    <h2 style="margin-bottom: 8px;">Hello ${username},</h2>
                    <p>Thanks for registering on GrowTyping.</p>
                    <p>Please verify your email by clicking the link below:</p>
                    <p>
                        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 16px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px;">
                            Verify Account
                        </a>
                    </p>
                    <p>If the button does not work, copy and paste this URL in your browser:</p>
                    <p>${verificationUrl}</p>
                    <p>This link expires in 24 hours.</p>
                </div>
            `,
        });
        console.log("Verification email sent successfully to:", to);
    } catch (error) {
        console.error("Error sending verification email:", {
            to,
            message: error?.message,
            code: error?.code,
        });
        throw error;
    }
};

const sendPasswordResetMail = async({ to, username, newPassword }) =>{
    if(!transporter){
        console.log("SMTP config missing. Password reset not sent.");
        return;
    }

    try {
        console.log("Sending password reset email to:", to);
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject: "Your GrowTyping Password Reset",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
                    <h2 style="margin-bottom: 8px;">Hello ${username},</h2>
                    <p>We received a request to reset your GrowTyping password.</p>
                    <p>Your new temporary password is:</p>
                    <p style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 16px; font-weight: bold; text-align: center; color: #1f2937;">
                        ${newPassword}
                    </p>
                    <p style="margin-top: 16px; color: #ef4444;"><strong>Important:</strong> We recommend changing this password after logging in.</p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">
                        © GrowTyping. This is an automated email, please do not reply.
                    </p>
                </div>
            `,
        });
        console.log("Password reset email sent successfully to:", to);
    } catch (error) {
        console.error("Error sending password reset email:", {
            to,
            message: error?.message,
            code: error?.code,
        });
        throw error;
    }
};

export{ sendVerificationMail, sendPasswordResetMail, hasSmtpConfig };
