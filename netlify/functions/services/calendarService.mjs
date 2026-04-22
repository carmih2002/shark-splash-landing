import { google } from 'googleapis';

export async function createCalendarEvent(booking) {
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey   = process.env.GOOGLE_PRIVATE_KEY;
    const calendarId   = process.env.GOOGLE_CALENDAR_ID || 'primary';

    if (!serviceEmail || !privateKey) {
        console.log('[CalendarService] MOCK – credentials not set, skipping real create');
        console.log(`[CalendarService] Would create event: "מתנפח - ${booking.name}" on ${booking.date}`);
        return;
    }

    const auth = new google.auth.JWT({
        email: serviceEmail,
        key:   privateKey.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/calendar']
    });

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.insert({
        calendarId,
        requestBody: {
            summary: `מתנפח - ${booking.name}`,
            start:   { date: booking.date },
            end:     { date: booking.date },
            description: [
                `שם: ${booking.name}`,
                `טלפון: ${booking.phone}`,
                `סוג אירוע: ${booking.eventType}`,
            ].join('\n')
        }
    });
}
