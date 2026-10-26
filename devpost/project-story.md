## Inspiration

Scaffold was inspired by my own experience with illustration. I enjoy creating, but struggle to stay consistent without clear, assigned tasks. Books and tutorials give me that structure, but I wanted support that could turn my own goal into manageable daily action.

Scaffold helps you define a goal, creates a personal plan of small tasks, sends gentle WhatsApp nudges, and shows your progress as a house growing brick by brick.

## How I built it

I used Claude for design planning, turning the idea into a coherent experience before implementation. We defined the scope, product requirements, design and technical approach, then built in small, testable slices.

The stack includes:

- **Next.js, React and Tailwind CSS** for the web app.
- **Supabase** for accounts, data, proof photos and scheduled reminders.
- **Claude** for goal-setting conversations and personalised plans.
- **Twilio** for WhatsApp nudges.
- **Resend** for email backup.
- **Vercel** for hosting.

## Challenges

WhatsApp nudges were particularly difficult to implement and required extensive troubleshooting. We worked through account restrictions, sandbox settings, incoming-message routing and delivery windows.

Testing each connection separately helped identify where messages were getting stuck. We also had to verify real delivery on my phone: a successful simulated test did not prove the entire connection worked.

## What I learned

I learned how to take advantage of Claude's design planning and how valuable it is to plan before implementing.

Defining the scope, requirements and technical approach made decisions clearer. Building in small slices gave us working checkpoints and made troubleshooting more manageable.

I also learned that finishing a proof of concept means making deliberate choices about what to defer. We focused on proving Scaffold's central idea: a clear task, a nudge that reaches you, and visible progress.
