import { getISOWeek } from 'date-fns';
import fetch from 'node-fetch'; // Vercel functions support global fetch, but usually good to be explicit or use native fetch in node 18+

export default async function handler(req, res) {
    // Use authorization header to ensure only Vercel Cron can call this
    const authHeader = req.headers.authorization;
    if (
        !process.env.CRON_SECRET ||
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return res.status(401).json({ error: 'Unauthorized. Need CRON_SECRET.' });
    }

    try {
        const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
        const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

        if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
            return res.status(500).json({ error: 'Missing OneSignal credentials' });
        }

        // Tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Calculate Week
        const tomorrowWeek = getISOWeek(tomorrow);
        const isDeload = tomorrowWeek % 4 === 0;

        const message = isDeload
            ? "Tomorrow starts your Deload week! Take it easy."
            : "Tomorrow starts your Load week! Time to push.";

        const title = isDeload ? "Deload next week" : "Load next week";

        // Call OneSignal API to send Push Notification
        // We use the "paused" tag to exclude users who have paused notifications
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                target_channel: "push",
                contents: { en: message },
                headings: { en: title },
                // Target users who are not explicitly paused
                filters: [
                    { field: "tag", key: "paused", relation: "=", value: "false" },
                    { operator: "OR" },
                    { field: "tag", key: "paused", relation: "not_exists" }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("OneSignal API error", data);
            return res.status(500).json({ error: 'Failed to send notification via OneSignal', details: data });
        }

        return res.status(200).json({ success: true, message: message, onesignalResponse: data });
    } catch (error) {
        console.error('Error in cron job', error);
        return res.status(500).json({ error: error.message });
    }
}
