import nodemailer from 'nodemailer';

const EVENT_TYPE_LABELS = {
    birthday: 'יום הולדת',
    school:   'סיום שנה / גן',
    summer:   'מסיבת קיץ',
    family:   'אירוע משפחתי',
    other:    'אחר'
};

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function buildEmailHtml(booking) {
    const date      = formatDate(booking.date);
    const eventType = EVENT_TYPE_LABELS[booking.eventType] || booking.eventType;

    const row = (label, value, valueColor = '#1a1a2e') => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #eef2f7;color:${valueColor};font-size:15px;">${value}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #eef2f7;color:#4a5568;font-weight:600;font-size:15px;white-space:nowrap;">${label}</td>
      </tr>`;

    return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#f4f8fc;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" border="0"
             style="background:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.08);overflow:hidden;">
        <tr>
          <td colspan="2" style="padding:24px 16px 16px;border-bottom:2px solid #2DAAE1;">
            <span style="font-size:1.3rem;font-weight:700;color:#0B3C5D;">🦈 הזמנה חדשה התקבלה</span>
          </td>
        </tr>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${row('תאריך', date)}
          ${row('שם', booking.name)}
          ${row('מספר טלפון', booking.phone)}
          ${row('סוג האירוע', eventType)}
          ${row('תנאי שימוש', 'אושר ✓', '#27ae60')}
        </table>
        <tr>
          <td colspan="2" style="padding:16px;text-align:center;font-size:12px;color:#a0aec0;">
            נשלח אוטומטית מ-Shark Splash · ${new Date().toLocaleString('he-IL')}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildEmailText(booking) {
    const date      = formatDate(booking.date);
    const eventType = EVENT_TYPE_LABELS[booking.eventType] || booking.eventType;
    return [
        'הזמנה חדשה - מתנפח',
        '─────────────────────',
        `תאריך:          ${date}`,
        `שם:             ${booking.name}`,
        `מספר טלפון:     ${booking.phone}`,
        `סוג האירוע:     ${eventType}`,
        `תנאי שימוש:     אושר`,
    ].join('\n');
}

export async function sendBookingEmail(booking) {
    const user     = process.env.GMAIL_USER;
    const password = process.env.GMAIL_APP_PASSWORD;
    const notifyTo = process.env.NOTIFY_EMAIL || user;

    if (!user || !password) {
        console.log('[EmailService] MOCK – credentials not set, skipping real send');
        console.log('[EmailService] Would send to:', notifyTo);
        console.log('[EmailService] Subject: הזמנה חדשה - מתנפח');
        console.log('[EmailService] Body preview:\n' + buildEmailText(booking));
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass: password }
    });

    await transporter.sendMail({
        from:    `"Shark Splash 🦈" <${user}>`,
        to:      notifyTo,
        subject: 'הזמנה חדשה - מתנפח',
        text:    buildEmailText(booking),
        html:    buildEmailHtml(booking)
    });
}
