// Run with: node test-booking.mjs
// Tests the full mock flow: validation -> email -> calendar (no real credentials needed)

import { sendBookingEmail }   from './netlify/functions/services/emailService.mjs';
import { createCalendarEvent } from './netlify/functions/services/calendarService.mjs';

const testBooking = {
    name:        'ישראל ישראלי',
    phone:       '050-1234567',
    date:        '2026-07-15',
    eventType:   'birthday',
    terms:       true,
    submittedAt: new Date().toISOString()
};

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Shark Splash – Full Flow Test (Mock)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Booking data:', testBooking, '\n');

const results = await Promise.allSettled([
    sendBookingEmail(testBooking),
    createCalendarEvent(testBooking)
]);

console.log('\n── Results ──────────────────────────────');
console.log('Email service:   ', results[0].status === 'fulfilled' ? '✓ OK' : '✗ FAILED – ' + results[0].reason?.message);
console.log('Calendar service:', results[1].status === 'fulfilled' ? '✓ OK' : '✗ FAILED – ' + results[1].reason?.message);
console.log('\n✓ Full flow test complete.');
