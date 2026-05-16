import nodemailer from 'nodemailer';

// Create reusable transporter using SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const FROM_ADDRESS = process.env.SMTP_FROM || 'GoStartHub <noreply@gostarthub.com>';

// Email template wrapper
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #10b981; }
        .title { font-size: 20px; font-weight: 600; color: #111; margin-bottom: 16px; }
        .content { color: #555; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 16px; }
        .button.decline { background: #ef4444; }
        .button.reminder { background: #3b82f6; }
        .details { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .details-label { color: #6b7280; font-size: 14px; }
        .details-value { color: #111; font-weight: 500; }
        .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo">🚀 GoStartHub</div>
            </div>
            ${content}
        </div>
        <div class="footer">
            <p>This is an automated message from GoStartHub.</p>
            <p>© ${new Date().getFullYear()} GoStartHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

interface CallDetails {
    title?: string;
    scheduledAt: Date;
    duration: number;
    proposerName: string;
    recipientName: string;
    startupTitle: string;
}

// Send email when a call is scheduled
export async function sendScheduledCallEmail(
    recipientEmail: string,
    details: CallDetails
) {
    const formattedDate = new Date(details.scheduledAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const content = `
        <h2 class="title">📅 New Call Scheduled</h2>
        <div class="content">
            <p>Hi ${details.recipientName},</p>
            <p><strong>${details.proposerName}</strong> has scheduled a call with you regarding <strong>${details.startupTitle}</strong>.</p>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Date & Time</span>
                    <span class="details-value">${formattedDate}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Duration</span>
                    <span class="details-value">${details.duration} minutes</span>
                </div>
                ${details.title ? `
                <div class="details-row">
                    <span class="details-label">Topic</span>
                    <span class="details-value">${details.title}</span>
                </div>
                ` : ''}
            </div>
            
            <p>Please log in to your dashboard to confirm or decline this call.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: FROM_ADDRESS,
            to: recipientEmail,
            subject: `📅 New Call Scheduled - ${details.startupTitle}`,
            html: emailWrapper(content),
        });
        console.log(`Scheduled call email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send scheduled call email:', error);
        return false;
    }
}

// Send email when a call is confirmed
export async function sendCallConfirmedEmail(
    recipientEmail: string,
    details: CallDetails
) {
    const formattedDate = new Date(details.scheduledAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const content = `
        <h2 class="title">✅ Call Confirmed!</h2>
        <div class="content">
            <p>Hi ${details.proposerName},</p>
            <p>Great news! <strong>${details.recipientName}</strong> has confirmed your scheduled call for <strong>${details.startupTitle}</strong>.</p>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Date & Time</span>
                    <span class="details-value">${formattedDate}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Duration</span>
                    <span class="details-value">${details.duration} minutes</span>
                </div>
            </div>
            
            <p>You'll receive a reminder 1 hour before the call.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: FROM_ADDRESS,
            to: recipientEmail,
            subject: `✅ Call Confirmed - ${details.startupTitle}`,
            html: emailWrapper(content),
        });
        console.log(`Confirmed call email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send confirmed call email:', error);
        return false;
    }
}

// Send email when a call is declined
export async function sendCallDeclinedEmail(
    recipientEmail: string,
    details: CallDetails
) {
    const formattedDate = new Date(details.scheduledAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const content = `
        <h2 class="title">❌ Call Declined</h2>
        <div class="content">
            <p>Hi ${details.proposerName},</p>
            <p><strong>${details.recipientName}</strong> has declined your scheduled call for <strong>${details.startupTitle}</strong>.</p>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Original Date</span>
                    <span class="details-value">${formattedDate}</span>
                </div>
            </div>
            
            <p>Please reach out to reschedule at a more convenient time.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: FROM_ADDRESS,
            to: recipientEmail,
            subject: `❌ Call Declined - ${details.startupTitle}`,
            html: emailWrapper(content),
        });
        console.log(`Declined call email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send declined call email:', error);
        return false;
    }
}

// Send reminder email 1 hour before call
export async function sendCallReminderEmail(
    recipientEmail: string,
    recipientName: string,
    otherPartyName: string,
    details: CallDetails
) {
    const formattedTime = new Date(details.scheduledAt).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const content = `
        <h2 class="title">⏰ Call Reminder - Starting Soon!</h2>
        <div class="content">
            <p>Hi ${recipientName},</p>
            <p>This is a reminder that your call with <strong>${otherPartyName}</strong> regarding <strong>${details.startupTitle}</strong> is starting in <strong>1 hour</strong>.</p>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Time</span>
                    <span class="details-value">${formattedTime}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Duration</span>
                    <span class="details-value">${details.duration} minutes</span>
                </div>
            </div>
            
            <p>Log in to your dashboard to join the call when it's time.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: FROM_ADDRESS,
            to: recipientEmail,
            subject: `⏰ Reminder: Call in 1 hour - ${details.startupTitle}`,
            html: emailWrapper(content),
        });
        console.log(`Reminder email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send reminder email:', error);
        return false;
    }
}
