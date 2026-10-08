---
doc: scope
status: approved
---

# Dream Friend (working title)

A friend who keeps you on track with a goal you care about. She gives you one clear task each day and nudges you on WhatsApp to do it.

## The Unique Kernel
**Clear, assigned tasks plus a nudge that reaches you.** The learner's problem isn't a missing plan: "I have a goal and I might even have a great plan, but if I'm not working on it I'll never achieve it." What works for them is step-by-step books and videos, because "I either did the task or I didn't." So the friend turns a goal into one small, finishable task a day, reminds you on WhatsApp along with your own why, and shows you how far you've come, Duolingo-style.

## Who It's For
Someone who enjoys something and wants to get better at it, but struggles to be consistent without clear, assigned tasks. Today they rely on step-by-step books and videos, and drift when those run out or life gets busy.
First real user: the learner, who wants to become a better illustrator. Built so others with any goal could use it too.

## The Core Loop
1. **Set up once:** the goal, why it matters (saved to remind you later), and roughly how much time you have.
2. **Get nudged:** a WhatsApp message with today's task and a reminder of your why.
3. **Do today's task:** one clear, small exercise, e.g. "draw 10 hands, 3 minutes each."
4. **Mark it done** in the app. You either did it or you didn't.
5. **See progress:** a Duolingo-style streak or path showing how far you've come.

You come back because the nudge finds you, the task is small and clear, and the progress is visible.

## Inspiration & Identity
- **Duolingo** (https://www.duolingo.com): clear daily lessons, reminders, visible progress and streaks.
- **Khan Academy** (https://www.khanacademy.org): a ready-made path that makes learning less intimidating.
- Step-by-step drawing books and video courses: clear tasks, practice over theory.
- Tone: a gentle, encouraging friend ("she"), not a drill sergeant. Simple, never overwhelming.

## Why This Matters to the Learner
"I really enjoy art and creating it, but I struggle to be consistent when I don't have clear, assigned tasks." The learner is also practicing being a PM: "understand exactly why I am making certain decisions, and creating something with value and purpose based on a need."

## What "Working" Looks Like
In a ~1-minute demo, the learner sets up "become a better illustrator," says why, and says how much time they have. Their **phone buzzes with a WhatsApp message**: today's task plus their why. They open the app, see the same clear task, mark it done, and the progress bar or streak moves.
**The "oh, that's cool" beat:** the nudge arrives on a real phone, in the learner's own words about why they started.

## The POC Boundary
- One-time setup: goal → why → available time
- A clear, small daily task the friend assigns toward that goal
- Marking the task done (did it or didn't)
- A visible progress indicator (streak or path)
- A WhatsApp nudge sent to the learner's own phone with today's task and their why, using the Twilio WhatsApp Sandbox (a free test setup)

## Later
- Replying "done" directly in WhatsApp (two-way chat)
- Refreshers that bring back things you learned earlier
- A log of what you learned from each task
- Real, cited sources behind tasks and suggestions, so she never gives bad advice
- Adjusting tasks to how you're feeling that day
- Fuller gamification: levels, rewards
- A follow-up conversation ("here's how it went") that adjusts the next task
- Help planning brand-new goals from scratch (e.g. starting an AI group for women in Gijón)

## Explicitly Cut
- **Two-way WhatsApp:** receiving replies requires the app to be reachable from the internet. That's too much for 2–4 hours; one-way nudges prove the idea.
- **Real-sources research:** it matters ("bad advice is worse than no advice at all"), but the focus shifted from planning to follow-through, and WhatsApp took that time. It's first in line for a later version.
- **Refreshers and learning log:** valuable for retention, but not needed to prove "a clear task plus a nudge keeps me going."
- **Production WhatsApp (business approval, messaging anyone):** the sandbox only messages people who've joined it, which is fine for a demo.
