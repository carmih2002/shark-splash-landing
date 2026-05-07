import { google } from 'googleapis';

export async function appendToSheet(booking) {
    const serviceEmail  = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey    = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!serviceEmail || !privateKey || !spreadsheetId) {
        console.log('[SheetsService] MOCK – credentials not set, skipping real append');
        console.log(`[SheetsService] Would append: ${booking.name}, ${booking.phone}`);
        return;
    }

    const auth = new google.auth.JWT({
        email: serviceEmail,
        key:   privateKey.replace(/\\n/g, '\n').replace(/\r/g, ''),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:B',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[booking.name, booking.phone]]
        }
    });
}
