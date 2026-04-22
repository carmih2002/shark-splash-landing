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

    return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f8fc; margin: 0; padding: 24px; direction: rtl; }
    .card { background: #ffffff; border-radius: 12px; padding: 32px; max-width: 480px;
            margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    h2 { color: #0B3C5D; margin: 0 0 24px; font-size: 1.4rem; border-bottom: 2px solid #2DAAE1; padding-bottom: 12px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0;
           border-bottom: 1px solid #eef2f7; font-size: 0.97rem; }
    .label { color: #4a5568; font-weight: 600; }
    .value { color: #1a1a2e; }
    .terms { color: #27ae60; font-weight: 700; }
    .footer { margin-top: 24px; font-size: 0.82rem; color: #a0aec0; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🦈 הזמנה חדשה התקבלה</h2>
    <div class="row"><span class="label">תאריך</span><span class="value">${date}</span></div>
    <div class="row"><span class="label">שם</span><span class="value">${booking.name}</span></div>
    <div class="row"><span class="label">מספר טלפון</span><span class="value">${booking.phone}</span></div>
    <div class="row"><span class="label">סוג האירוע</span><span class="value">${eventType}</span></div>
    <div class="row"><span class="label">תנאי שימוש</span><span class="value terms">אושר ✓</span></div>
    <div class="footer">נשלח אוטומטית מ-Shark Splash · ${new Date().toLocaleString('he-IL')}</div>
  </div>
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
