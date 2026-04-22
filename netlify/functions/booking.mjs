import { sendBookingEmail } from './services/emailService.mjs';
import { createCalendarEvent } from './services/calendarService.mjs';

// ── Validation ────────────────────────────────────────────────────────────────

function validatePayload(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2)
        errors.push('שם מלא חייב להכיל לפחות 2 תווים');

    if (data.name && data.name.length > 100)
        errors.push('שם ארוך מדי');

    const phoneClean = (data.phone || '').replace(/[\s\-]/g, '');
    if (!/^0[5][0-9]{8}$/.test(phoneClean))
        errors.push('מספר טלפון לא תקין');

    if (!data.date)
        errors.push('יש לבחור תאריך');
    else {
        const chosen = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(chosen.getTime()))
            errors.push('תאריך לא תקין');
        else if (chosen <= today)
            errors.push('התאריך חייב להיות עתידי');
    }

    const allowedEventTypes = ['birthday', 'school', 'summer', 'family', 'other'];
    if (!data.eventType || !allowedEventTypes.includes(data.eventType))
        errors.push('סוג אירוע לא תקין');

    if (!data.terms)
        errors.push('יש לאשר את תנאי השימוש');

    return errors;
}

// ── Logger ────────────────────────────────────────────────────────────────────

function log(level, message, meta = {}) {
    console.log(JSON.stringify({
        level,
        message,
        timestamp: new Date().toISOString(),
        ...meta
    }));
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async (req) => {
    log('info', 'Booking endpoint called');

    if (req.method !== 'POST') {
        return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
    }

    let data;
    try {
        data = await req.json();
    } catch {
        log('warn', 'Invalid JSON received');
        return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Drop honeypot submissions silently
    if (data._honeypot) {
        log('info', 'Honeypot triggered – silent drop');
        return Response.json({ ok: true }, { status: 200 });
    }

    const errors = validatePayload(data);
    if (errors.length > 0) {
        log('warn', 'Validation failed', { errors });
        return Response.json({ error: errors[0], errors }, { status: 422 });
    }

    const booking = {
        name:      data.name.trim(),
        phone:     data.phone.trim(),
        date:      data.date,
        eventType: data.eventType,
        submittedAt: data.submittedAt || new Date().toISOString()
    };

    log('info', 'New booking received', { name: booking.name, date: booking.date, eventType: booking.eventType });

    const results = await Promise.allSettled([
        sendBookingEmail(booking),
        createCalendarEvent(booking)
    ]);

    const emailResult   = results[0];
    const calendarResult = results[1];

    if (emailResult.status === 'rejected')
        log('error', 'Email service failed', { reason: emailResult.reason?.message, stack: emailResult.reason?.stack });
    else
        log('info', 'Email sent successfully');

    if (calendarResult.status === 'rejected')
        log('error', 'Calendar service failed', { reason: calendarResult.reason?.message, stack: calendarResult.reason?.stack });
    else
        log('info', 'Calendar event created');

    // Return success even if secondary services failed – booking was received
    return Response.json({ ok: true }, { status: 200 });
};

export const config = { path: '/api/booking' };
