export default async () => {
    return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            email:    !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD,
            calendar: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && !!process.env.GOOGLE_PRIVATE_KEY
        }
    });
};

export const config = { path: '/api/health' };
