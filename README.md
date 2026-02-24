# LoadTracker 🏋️‍♂️

A hyper-minimalist, iOS-optimized Progressive Web App (PWA) designed to do exactly one thing: tell you if you are in a "Load" or "Deload" workout week, and notify you the day before it changes. 

No bloated workout logs, no social feeds—just a solid Green screen for Load, a solid Orange screen for Deload, and a toggle to pause notifications.

## Features
* **Zero-Friction UI:** The entire screen *is* the interface. Green = Load, Orange = Deload.
* **Automated Cycle:** Uses ISO week numbers (WK1–WK52). Weeks 1, 2, and 3 are Load weeks. Week 4 is a Deload week. Automatically resets with the calendar year.
* **iOS Web Push Notifications:** Prompts users to "Add to Home Screen" (required for iOS 16.4+ web push), sending a notification every Sunday at 10:00 AM regarding the upcoming week.
* **Pause Toggle:** A simple button to pause/resume notifications, saving state locally and syncing tags with OneSignal.

## Architecture
* **Frontend:** React + Vite
* **PWA:** `vite-plugin-pwa` (handles manifest and service workers)
* **Date Logic:** `date-fns` 
* **Notifications:** OneSignal Web SDK
* **Backend/Scheduling:** Vercel Cron Jobs (Node.js serverless function)

---

## Prerequisites
1. **Node.js** installed (v16+ recommended).
2. A **OneSignal** account (Free tier is perfect).
3. A **Vercel** account (for hosting and the free Cron job).

---

## Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/LoadTracker.git](https://github.com/yourusername/LoadTracker.git)
cd LoadTracker

```

### 2. Install Dependencies

```bash
npm install

```

### 3. OneSignal Configuration

1. Create a new Web app in your [OneSignal Dashboard](https://onesignal.com/).
2. Get your **App ID** and **REST API Key**.
3. Create a `.env` file in the root of your project and add your keys:
```env
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id_here
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key_here

```


*(Note: The API key is only needed by the Vercel backend. Never expose it in the Vite frontend).*

### 4. Run Locally

```bash
npm run dev

```

Open `http://localhost:5173`. To test the iOS PWA "Add to Home Screen" prompt, you can use Safari on an iOS simulator or device via local network.

---

## Deployment (Vercel)

This app relies on Vercel to host both the Vite frontend and the Node.js Cron Job that triggers the Sunday notifications.

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the root directory and follow the prompts to link your project.
3. Add your Environment Variables (`VITE_ONESIGNAL_APP_ID` and `ONESIGNAL_REST_API_KEY`) to your Vercel project dashboard.
4. Deploy the app: `vercel --prod`

### How the Cron Job Works

The file `api/notify.js` contains a serverless function, and `vercel.json` tells Vercel to run it every Sunday at 10:00 AM.
The script calculates the *upcoming* week's status using `date-fns`, formats the message, and hits the OneSignal API to send the push to all users who do not have the `paused: "true"` tag.

---

## The Logic (Math)

The cycle relies on a simple modulo operation based on the current ISO week number.

```javascript
// If the week number is perfectly divisible by 4, it's a Deload week.
const isDeload = weekNumber % 4 === 0; 

```

* Week 1 % 4 = 1 (Load)
* Week 2 % 4 = 2 (Load)
* Week 3 % 4 = 3 (Load)
* Week 4 % 4 = 0 (Deload)
* Repeats infinitely...

---

## Important Note on iOS Push Notifications

Apple restricts Web Push notifications to devices running **iOS 16.4 or later**. Furthermore, the user **must** add the app to their Home Screen before Safari will allow the app to request notification permissions. The UI includes a prompt to guide users through this flow if they are viewing the app in the standard mobile browser.

## License

MIT
