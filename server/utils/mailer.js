import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Detect the correct frontend URL for email links
const getFrontendUrl = () => {
    if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
    return 'https://gestao-frotas-lime.vercel.app';
};

export const sendVerificationEmail = async (email, token) => {
    const frontendUrl = getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    try {
        await transporter.sendMail({
            from: `"Gestão de Frotas" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verifique sua conta - Gestão de Frotas",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Bem-vindo ao Gestão de Frotas!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Para ativar sua conta, por favor clique no link abaixo. 
                        Este link expira em <strong>24 horas</strong>.
                    </p>
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; 
                              color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                        Verificar Email
                    </a>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        Se você não criou esta conta, ignore este email.
                    </p>
                </div>
            `
        });
    } catch (err) {
        console.warn('Erro ao enviar email, verifique as configurações SMTP.', err.message);
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    const frontendUrl = getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    try {
        await transporter.sendMail({
            from: `"Gestão de Frotas" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Redefinir Senha - Gestão de Frotas",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Recuperação de Senha</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Você solicitou uma alteração de senha. Clique no link abaixo para redefinir.
                        Este link expira em <strong>1 hora</strong>.
                    </p>
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; 
                              color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                        Redefinir Senha
                    </a>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        Se você não solicitou isso, ignore este email.
                    </p>
                </div>
            `
        });
    } catch (err) {
        console.warn('Erro ao acessar SMTP para recuperar senha.', err.message);
    }
};
