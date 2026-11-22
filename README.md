# Sandy's 27th — The Burger Tour 🍔🎸

A mobile invitation site with an RSVP, built with Next.js and hosted on Vercel.

**The flow**
1. The guest types their name or PSN. If they're on the list, a stickman with their face pops up and asks "Is this you?"
2. They see the invite (gig-poster style), then RSVP:
   - **I'm in:** they say solo or +1 (with a selfie or one of 20 animal faces) and what food they'll bring.
   - **Not sure yet:** they leave an email and get a reminder before the deadline.
   - **I can't come:** "Are you sure?", then a jump scare, then "FUCK YOU AND YOUR PLAN." with a fake nude-leak bar that gets stuck at 99%. It's a joke: nothing is uploaded or sent.
3. The party board shows a jumping stickman crowd, the headcount, date and place, add-to-calendar buttons, the setlist, the coffee menu and the food board.

Background music plays after the first tap, and a mute button stays in the corner.

---

## 1. Run it on your laptop

```bash
npm install
cp .env.example .env.local   # you can leave it empty for local testing
npm run dev
```

Open http://localhost:3000 and log in as `Budi` (or `bud`, `budi_gg`) or `Rina`.
On your laptop, RSVPs are saved to `.data/rsvps.json`. Delete that file to start over.

To test on your phone over the same Wi-Fi: `npm run dev -- -H 0.0.0.0`, then open
`http://<your-laptop-ip>:3000`.

## 2. Fill in your stuff

| What | Where |
| --- | --- |
| Guest list (names, PSN, photo, +1 allowed, email, note) | `src/data/guests.ts` |
| Guest face photos | `public/guests/` (e.g. `budi.jpg`) |
| Date, time, place, maps link, agenda, deadline, dress code | `src/data/event.ts` |
| Your photo for the poster | `public/images/` + `host.photo` in `event.ts` |
| Kopi MO menu photo | `public/images/` + `coffeeMenuImage` in `event.ts` |
| Background music | `public/audio/bgm.mp3` |
| Jump-scare voice/scream | `public/audio/scare.mp3` |
| Ghost image for the jump scare | `public/images/ghost.png` (missing = the drawn ghost) |
| Harmless blurry images for the leak joke (optional) | `leakPrank.images` in `event.ts` |

⚠️ **The date and time in `event.ts` are placeholders (12 Dec, 15:00).** Change them, plus
`[LOCATION]`, `[ADDRESS]` and the maps link, before you send the invite.

Photo tips: square, face centred, about 400×400, JPG. Small files load fast on mobile data.

## 3. Set up Supabase (saves RSVPs + 1 photos)

1. Create a free project at https://supabase.com.
2. **SQL Editor → New query**: paste `supabase/schema.sql` and click **Run**. This creates the
   `rsvps` table and the `plus-ones` photo bucket.
3. **Project Settings → API**: copy the **Project URL** and the **service_role** key.
   The service_role key is a secret: only put it in env variables, never in code.

To see who's coming, open **Table Editor → rsvps** in Supabase.

Free Supabase projects pause after about a week with no activity. Open the dashboard now and
then until the party, or just keep the invite busy.

## 4. Set up the reminder email (Gmail)

1. Turn on 2-Step Verification for your Google account (https://myaccount.google.com/security).
2. Make an app password at https://myaccount.google.com/apppasswords (name it e.g. "sandy27").
   Google shows a 16-letter code once. Copy it.
3. Set `GMAIL_USER` to your Gmail address and `GMAIL_APP_PASSWORD` to that code.
   `REMINDER_FROM_NAME` is optional and sets the sender name.
4. `vercel.json` runs the reminder once, on **Friday 27 November at 09:00 WIB**. It emails everyone
   still on "Not sure yet" who left an email. Each person only gets it once.
   To send it by hand:
   `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-site/api/cron/remind`

## 5. Deploy to Vercel

1. Push this folder to a GitHub repo and import it at https://vercel.com/new.
2. In **Settings → Environment Variables**, add everything from `.env.example`:
   `SESSION_SECRET`, `SITE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `REMINDER_FROM_NAME`, `CRON_SECRET`.
   (Make `SESSION_SECRET` with `openssl rand -base64 32`.)
3. Deploy, open the link on your phone and do a full test run as one of the guests.
4. Send the link on WhatsApp. The preview image comes from `src/app/opengraph-image.tsx`.

To reset a test RSVP, delete that guest's row in Supabase.

---

## How it's built

- **Next.js 16** (App Router, Cache Components, Server Actions), TypeScript, Tailwind CSS v4
- **GSAP** for the stickman pop-up, the crowd jumping and the jump-scare shake
- **Supabase** (Postgres + Storage) in production, a JSON file locally
- **Gmail** (Nodemailer) + **Vercel Cron** for the reminder email
- Fonts: Anton, Archivo, Permanent Marker (self-hosted with Fontsource)

```
src/
  data/guests.ts        ← guest list
  data/event.ts         ← party details, audio, scare, leak settings
  app/
    page.tsx            login (name/PSN → "Is this you?" → not invited)
    invite/             the gig poster
    rsvp/               I'm in / not sure / can't come → scare → bye
    party/              the crowd + food board
    bye/                where "can't come" guests end up
    menu/               Kopi MO menu
    actions.ts          server actions: lookup, confirm, save RSVP
    api/                +1 photo upload, .ics calendar, reminder cron
    opengraph-image.tsx WhatsApp link preview
  components/           screens, stickmen, 20 animal faces, music player
  lib/                  session cookie, name matching, storage, calendar, email
supabase/schema.sql
```

**Security notes**
- Guests are identified by a signed, httpOnly cookie, so they can't fake being someone else.
- The guest list never reaches the browser. The name check runs on the server.
- The jump-scare sound plays because the guest taps a button first. Phones only allow sound
  after a tap.
