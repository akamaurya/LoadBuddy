import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { differenceInDays, parseISO, addDays } from "npm:date-fns@3.3.1";
import { formatInTimeZone } from "npm:date-fns-tz@3.1.3";
import { phaseFor } from "../_shared/phase.ts";

const onesignalAppId = Deno.env.get("ONESIGNAL_APP_ID") || "";
const onesignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Profile {
    id: string;
    timezone: string | null;
    start_date: string | null;
    cycle_length_weeks: number;
    deload_length_weeks: number;
    notification_hour: number | null;
    notification_days_before: number | null;
}

const PROFILE_COLUMNS =
    "id, timezone, start_date, cycle_length_weeks, deload_length_weeks, notification_hour, notification_days_before";

Deno.serve(async (req) => {
    try {
        // --- Auth guard: only allow requests with a valid CRON_SECRET ---
        const cronSecret = Deno.env.get("CRON_SECRET");
        const authHeader = req.headers.get("Authorization");
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // PostgREST caps a response at max_rows (1000 by default), so page
        // through rather than silently dropping every user past the first page.
        const PAGE_SIZE = 1000;
        const profiles: Profile[] = [];
        for (let from = 0; ; from += PAGE_SIZE) {
            const { data, error } = await supabase
                .from('profiles')
                .select(PROFILE_COLUMNS)
                .eq('paused', false) // paused users opted out of reminders
                .order('id')
                .range(from, from + PAGE_SIZE - 1)
                .returns<Profile[]>();
            if (error) throw error;
            if (!data?.length) break;
            profiles.push(...data);
            if (data.length < PAGE_SIZE) break;
        }

        // Bucket users by phase + days-ahead so each push states the right lead time.
        const buckets = new Map<string, string[]>(); // key: `${isDeload ? 1 : 0}:${daysAhead}`

        const nowUTC = new Date();

        for (const profile of profiles) {
            if (!profile.timezone || !profile.start_date || profile.notification_hour == null) continue;

            try {
                const currentHourLocalStr = formatInTimeZone(nowUTC, profile.timezone, 'H');
                const currentHourLocal = parseInt(currentHourLocalStr, 10);

                if (currentHourLocal === profile.notification_hour) {
                    // Use notification_days_before (default to 1 if not set)
                    const daysAhead = profile.notification_days_before || 1;
                    const futureDate = addDays(nowUTC, daysAhead);
                    const tzFutureDateStr = formatInTimeZone(futureDate, profile.timezone, 'yyyy-MM-dd');

                    const start = parseISO(profile.start_date);
                    start.setHours(0, 0, 0, 0);

                    const tzFutureDate = parseISO(tzFutureDateStr);
                    tzFutureDate.setHours(0, 0, 0, 0);

                    const daysSinceStart = differenceInDays(tzFutureDate, start);

                    const { isDeload, isPhaseStart } = phaseFor(
                        daysSinceStart, profile.cycle_length_weeks, profile.deload_length_weeks);

                    // Only notify when the look-ahead day is the first day of a new phase.
                    if (!isPhaseStart) continue;

                    const key = `${isDeload ? 1 : 0}:${daysAhead}`;
                    const bucket = buckets.get(key) ?? [];
                    bucket.push(String(profile.id));
                    buckets.set(key, bucket);
                }
            } catch (err) {
                console.error("Error processing profile", profile.id, err);
            }
        }

        if (buckets.size === 0) {
            return new Response(JSON.stringify({ status: "No notifications to send this hour." }), { headers: { "Content-Type": "application/json" } });
        }

        // Returns how many users were actually notified, so the response body
        // reports deliveries rather than attempts.
        const sendPush = async (userIds: string[], title: string, message: string): Promise<number> => {
            if (userIds.length === 0) return 0;

            const res = await fetch("https://onesignal.com/api/v1/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": `Basic ${onesignalRestApiKey}`
                },
                body: JSON.stringify({
                    app_id: onesignalAppId,
                    target_channel: "push",
                    include_aliases: { external_id: userIds },
                    headings: { en: title },
                    contents: { en: message },
                })
            });

            if (!res.ok) {
                console.error("OneSignal error text:", await res.text());
                return 0;
            }
            return userIds.length;
        };

        const sends = [...buckets].map(async ([key, userIds]) => {
            const [d, n] = key.split(':');
            const isDeload = d === '1';
            const daysAhead = parseInt(n, 10);
            const phase = isDeload ? "Deload" : "Load";
            const lead = daysAhead === 1 ? "tomorrow" : `in ${daysAhead} days`;
            const tail = isDeload ? "Take it easy." : "Time to push.";
            const when = lead.charAt(0).toUpperCase() + lead.slice(1);
            const sent = await sendPush(userIds, `${phase} week ${lead}`, `${when}, your ${phase} week begins! ${tail}`);
            return { isDeload, sent };
        });

        const results = await Promise.all(sends);
        const sentLoad = results.filter(r => !r.isDeload).reduce((n, r) => n + r.sent, 0);
        const sentDeload = results.filter(r => r.isDeload).reduce((n, r) => n + r.sent, 0);

        return new Response(JSON.stringify({
            status: "Success",
            sentLoad,
            sentDeload
        }), { headers: { "Content-Type": "application/json" } });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
});
