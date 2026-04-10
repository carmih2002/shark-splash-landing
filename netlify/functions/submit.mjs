export default async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    let data;
    try {
        data = await req.json();
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    // Honeypot check – bots fill this field, humans don't see it
    if (data.website) {
        return new Response('OK', { status: 200 });
    }

    // Server-side validation
    const { name, phone, date, eventType } = data;
    if (!name || !phone || !date || !eventType) {
        return new Response('Missing fields', { status: 400 });
    }
    if (name.length > 100 || phone.length > 20) {
        return new Response('Invalid input', { status: 400 });
    }

    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
        return new Response('Server misconfiguration', { status: 500 });
    }

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, date, eventType })
        });
    } catch {
        return new Response('Upstream error', { status: 502 });
    }

    return new Response('OK', { status: 200 });
};

export const config = { path: '/api/submit' };
