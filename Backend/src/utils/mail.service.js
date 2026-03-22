import nodemailer from "nodemailer";

const hasSmtpConfig =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_PORT) &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASS) &&
    Boolean(process.env.MAIL_FROM);

let transporter = null;

if(hasSmtpConfig){
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
}

const sendVerificationMail = async({ to, username, verificationUrl }) =>{
    if(!transporter){
        console.log("SMTP config missing. Verification URL:", verificationUrl);
        return;
    }

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
};

export{ sendVerificationMail, hasSmtpConfig };
