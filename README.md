# Ascend Training

Build a polished, minimalist workout tracking web app based EXACTLY on the attached workout-plan.md file.

The workout-plan.md is the source of truth for the current training program. Do not remove exercises, change the exercise order, change sets/reps, change the weekly structure, or invent exercises unless explicitly instructed below. The app should turn the Markdown workout plan into an interactive workout logger rather than simply displaying the Markdown.

The app is for a single user initially, but it MUST have a proper authentication system and user-specific persistent data so the architecture can support multiple users later.

==================================================

1. PRODUCT GOAL

==================================================

Create a premium-feeling personal workout dashboard that lets me:

- See today's workout immediately

- Start a workout

- Log every working set

- See what I did in previous sessions for the same exercise

- See suggested weight/reps based on my previous performance

- Record actual weight, reps, RIR and optional notes

- See clear instructions for how to perform every exercise

- Track progressive overload over time

- View strength/progression charts for every exercise

- Track bodyweight, height, waist and other body metrics

- See training history

- See weekly/monthly consistency

- Track cardio and core work

- Easily understand what I need to do next without navigating through complicated screens

The experience should feel like a modern premium fitness app, NOT like a spreadsheet.

==================================================

2. DESIGN DIRECTION

==================================================

Use a minimalist, modern, premium aesthetic.

Think:

- Apple Fitness / Whoop / modern strength-training app

- Clean typography

- Dark-first interface

- Subtle cards

- Lots of whitespace

- Minimal borders

- Muted colors

- One strong accent color

- Smooth but restrained animations

- Large readable numbers

- Excellent mobile experience

Avoid:

- Excessive gradients

- Huge colorful illustrations

- Gamified cartoon UI

- Clutter

- Excessive badges

- Tiny text

- Spreadsheet-like tables as the primary interface

The app should work beautifully on:

- Mobile

- Tablet

- Desktop

Mobile should be treated as a first-class experience because I will likely use the app inside the gym.

==================================================

3. AUTHENTICATION

==================================================

Implement authentication.

Support:

- Sign up

- Login

- Logout

- Forgot password

- Persistent sessions

Use Supabase authentication/database if available.

All workout logs and metrics must belong to the authenticated user.

Never expose another user's data.

Create proper database relationships using user_id.

==================================================

4. INITIAL USER PROFILE

==================================================

Create a profile/settings page.

Store:

- Name

- Height

- Current weight

- Starting weight

- Date of birth / age if provided

- Training experience

- Primary goal

- Optional target body-fat %

- Optional target weight

- Units: kg/lb

- Units: cm/ft-in

- Preferred cardio type

- Preferred rest timer duration

Initially populate the profile using the information provided in the existing context/file only where appropriate, but allow everything to be edited.

Do NOT hard-code these values into the UI.

==================================================

5. DASHBOARD / HOME

==================================================

After login, show a clean dashboard.

Top section:

"Good morning, [Name]"

Then:

TODAY'S WORKOUT

Show:

- Workout name

- Day

- Number of exercises

- Estimated duration

- Start Workout button

Example:

MONDAY

Chest + Side Delts + Triceps

7 exercises

~60–75 min

[ START WORKOUT ]

Below that, show a compact overview:

- Current weight

- Weight change over selected period

- Current streak

- Workouts this week

- Last workout

- Optional waist measurement

Then show:

"Continue where you left off"

if a workout was started but not completed.

==================================================

6. WORKOUT STRUCTURE

==================================================

Parse the attached workout-plan.md and create structured workout data.

The weekly structure must remain exactly as specified in the Markdown.

The app should understand:

- Monday

- Tuesday

- Wednesday

- Thursday

- Friday

- Saturday optional specialization

- Sunday rest

Saturday must preserve the specialization rotation:

Week 1 — Shoulders

Week 2 — Back

Week 3 — Arms

Week 4 — Shoulders

Week 5 — Back

Week 6 — Chest

Week 7 — Shoulders

Week 8 — Back

The user should be able to select the appropriate Saturday specialization.

Do not replace this with a generic workout generator.

==================================================

7. WORKOUT SCREEN

==================================================

When I tap START WORKOUT, open a focused workout interface.

At the top:

- Workout name

- Current day

- Workout timer

- Pause button

- Finish Workout button

Then display exercises sequentially.

Each exercise should have:

Exercise name

Target:

"4 × 8–10"

Rest:

"2–3 min"

RIR:

"1–2"

Previous performance:

"Last time: 35 kg × 9, 9, 8, 8"

Suggested starting weight:

"Try 35 kg"

Then the individual set logger.

==================================================

8. SET LOGGER

==================================================

Each set should be visually represented as a row/card.

Example:

SET 1

Weight

[ 35 ] kg

Reps

[ 9 ]

RIR

[ 2 ]

[ ✓ Complete Set ]

After completing it:

SET 1 ✓

35 kg × 9

RIR 2

Then automatically move focus toward the next set.

Allow editing completed sets.

Support:

- Weight

- Reps

- RIR

- Optional note

RIR should be optional but strongly encouraged for working sets.

Warm-up sets should be supported separately from working sets.

==================================================

9. PREVIOUS PERFORMANCE — VERY IMPORTANT

==================================================

Before each exercise, show my previous performance prominently.

Example:

LAST SESSION

35 kg

9 / 9 / 8 / 8

Average: 8.5 reps

Then show:

SUGGESTION

"Try 35 kg again and aim for 9–10 reps."

The suggestion should NOT blindly increase weight.

Use the workout plan's double-progression philosophy:

If the user reaches the top of the prescribed rep range across all working sets with appropriate RIR, suggest a small weight increase next time.

Example:

Target: 4 × 8–10

Previous:

35 kg

10 / 10 / 10 / 10

Suggestion:

"Increase to 37.5 kg next session."

If performance is lower:

Previous:

35 kg

9 / 9 / 8 / 8

Suggestion:

"Keep 35 kg and try to beat your previous reps."

If the user is cutting and performance is stable or slightly lower, do NOT label it as failure.

Use language such as:

"Strength maintained — good session."

==================================================

10. EXERCISE INSTRUCTIONS

==================================================

Every exercise in the workout plan should have an "How to perform" section.

This should be accessible by tapping:

"How to do it"

For each exercise provide:

- Setup

- Execution

- Breathing

- Key cues

- Common mistakes

- What the exercise should feel like

- Lower-back safety notes where relevant

Keep instructions concise and practical.

Example:

INCLINE SMITH MACHINE PRESS

Setup:

- Set bench to a moderate incline.

- Position yourself so the bar travels naturally toward the upper chest.

Execution:

- Lower under control.

- Keep shoulder blades stable.

- Press upward without losing position.

Cues:

- "Chest up"

- "Control the eccentric"

- "Drive through the palms"

Avoid:

- Excessive shoulder shrugging

- Bouncing the bar

- Excessive arching

Important:

Exercise instructions should correspond to the actual exercise in the workout plan.

Do not invent unnecessary variations.

==================================================

11. REST TIMER

==================================================

After completing a set, show an optional rest timer.

Default according to exercise type:

Compound:

2–3 minutes

Isolation:

60–90 seconds

Allow the user to:

- Start timer

- Skip

- Add 15 seconds

- Subtract 15 seconds

The next set should remain visible while the timer runs.

Example:

REST

01:42

[ +15 ] [ SKIP ]

NEXT:

Set 2

35 kg

Target 8–10 reps

==================================================

12. WORKOUT COMPLETION

==================================================

When I finish the workout, show a simple summary.

Example:

WORKOUT COMPLETE

Chest + Side Delts + Triceps

Duration:

68 min

Exercises:

7

Working sets:

22

Volume:

X kg

PRs:

2

Then ask:

"How did the workout feel?"

Options:

- Great

- Good

- Average

- Poor

Also allow:

Energy:

1–5

Difficulty:

1–5

Optional notes.

Save everything.

==================================================

13. PERSONAL RECORDS

==================================================

Automatically detect useful PRs.

Track:

- Highest weight

- Highest reps at a given weight

- Estimated 1RM where appropriate

- Best total volume

- Best set

- Best workout volume

Do NOT falsely call every heavier weight a PR if reps are dramatically lower.

Display:

NEW PR

Incline Smith Press

60 kg × 10

Small celebratory animation is okay, but keep it minimalist.

==================================================

14. EXERCISE PROGRESS CHARTS

==================================================

Create a dedicated PROGRESS section.

I want to select any exercise.

Example:

[ Incline Smith Machine Press ▼ ]

Then show:

Strength over time

A line chart showing my best performance over time.

Allow toggling between:

- Highest Weight

- Best Reps

- Estimated 1RM

- Volume

The chart should use actual logged data only.

Do not fabricate missing historical data.

Example:

Date | Weight | Reps

Jan 5 | 55 kg | 10

Jan 12 | 57.5 kg | 9

Jan 19 | 57.5 kg | 10

Jan 26 | 60 kg | 8

The chart should clearly show progression.

Also show a small stats section:

BEST WEIGHT

60 kg

BEST REPS

10

BEST EST. 1RM

X

TOTAL SESSIONS

18

LAST PERFORMED

Jan 26

Allow filtering:

- 1 month

- 3 months

- 6 months

- All time

IMPORTANT:

Do not create a single generic chart for the whole workout.

Each exercise needs its own progression history.

==================================================

15. WORKOUT HISTORY

==================================================

Create a HISTORY page.

Show previous workouts as cards:

Jan 26

Chest + Side Delts + Triceps

68 min

22 working sets

2 PRs

Clicking opens the complete historical workout.

Allow me to see:

- Exercise

- Set

- Weight

- Reps

- RIR

- Notes

==================================================

16. BODY METRICS

==================================================

Create a METRICS page.

Track:

- Bodyweight

- Waist

- Optional body-fat estimate

- Height

- Optional chest

- Optional arms

- Optional thighs

Allow manual entries by date.

Show trends.

For bodyweight:

line chart over time.

For waist:

line chart over time.

Also show:

Current

Previous

Change

Example:

WEIGHT

75.4 kg

↓ 0.6 kg

WAIST

79 cm

↓ 1 cm

Do not assume body-fat measurements are accurate.

If entered manually, label them as user-entered estimates.

==================================================

17. WEEKLY TRAINING SUMMARY

==================================================

Create a simple weekly overview.

Show:

Workouts:

4 / 5

Working sets:

XX

Optional Saturday:

Completed / Rest

Cardio:

XX minutes

Core:

XX sessions

PRs:

X

Use a clean visual progress indicator.

==================================================

18. CARDIO LOGGING

==================================================

The workout plan contains cardio.

Allow cardio logging with:

- Type

- Duration

- Distance if applicable

- Incline if applicable

- Speed if applicable

- Average heart rate if available

- Notes

Examples:

Incline treadmill walk

20 min

Bike HIIT

8 rounds

Cardio should appear in workout history.

==================================================

19. ABS / CORE LOGGING

==================================================

Treat core exercises like normal exercises.

Allow logging:

- Exercise

- Sets

- Reps

- Weight where applicable

- RIR

Track progression over time just like other exercises.

==================================================

20. DATA MODEL

==================================================

Use a proper relational database.

Recommended entities:

users

profiles

workout_templates

workout_days

workout_exercises

exercises

workout_sessions

exercise_sessions

sets

body_metrics

cardio_sessions

personal_records

exercise_notes

Each record should have appropriate IDs and timestamps.

All user-generated records must have user_id.

Workout templates can be shared/static, while workout sessions and metrics are user-specific.

Use proper foreign keys.

Do not store the entire workout history as one giant JSON blob.

Individual sets should be queryable.

==================================================

21. EXERCISE DATABASE

==================================================

Create an exercise database based on the exercises in workout-plan.md.

Each exercise should have:

- Name

- Primary muscle

- Secondary muscles

- Exercise category

- Equipment

- Instructions

- Cues

- Common mistakes

- Lower-back considerations

- Default rest period

- Default RIR target

- Rep range

This data should drive the workout UI.

==================================================

22. SMART LOGGING BEHAVIOR

==================================================

The app should learn from my history.

For each exercise:

Show:

LAST TIME

BEST SET

AVERAGE SET

LAST WEIGHT

LAST REPS

Then provide a conservative recommendation.

Examples:

"Repeat 35 kg and try for 1 more rep."

"You're ready to try 37.5 kg."

"Keep the weight. Your performance is stable."

Do NOT aggressively recommend weight increases.

Do NOT automatically change the workout plan.

Recommendations are suggestions only.

==================================================

23. CUT-AWARE TRAINING LOGIC

==================================================

The workout plan is being used during a fat-loss phase.

Therefore, the UI should understand:

"Maintaining strength during a cut is a success."

If performance is slightly lower than the previous workout, do not display negative messaging.

Instead:

"Performance slightly down — normal during a cut. Focus on maintaining technique."

If performance is stable:

"Strength maintained — excellent."

If performance improves:

"New best — great progress."

Keep this encouraging but not gamified.

==================================================

24. SEARCH / NAVIGATION

==================================================

Bottom navigation on mobile:

HOME

WORKOUT

PROGRESS

HISTORY

PROFILE

Desktop can use a left sidebar.

Global quick action:

START TODAY'S WORKOUT

Exercise search should allow quickly finding an exercise and viewing its history.

==================================================

25. SETTINGS

==================================================

Include:

Profile

Units

Rest timer defaults

Notification preferences

Theme

Account

Logout

Dark mode should be the default.

Allow light mode optionally.

==================================================

26. NOTIFICATIONS / REMINDERS

==================================================

If technically appropriate, allow optional reminders.

Examples:

"Today's workout is ready."

"You haven't logged a workout this week."

Do not make notifications annoying.

They should be optional.

==================================================

27. DATA SAFETY

==================================================

Workout data must persist across sessions.

Refreshing the page must NOT lose data.

If a workout is partially completed, automatically save progress.

If the browser closes during a workout, restore the unfinished workout.

Before deleting a workout or metric, ask for confirmation.

Never overwrite previous workout history when editing today's workout.

==================================================

28. UX DETAILS THAT MATTER

The app should make logging extremely fast.

I should be able to:

1. Open app

2. See today's workout

3. Start

4. See previous performance

5. Enter weight/reps

6. Tap complete

7. Rest timer starts

8. Enter next set

9. Finish

10. See progress

with minimal typing.

Use numeric keyboards on mobile for weight/reps.

Remember recently used weights.

Allow quick +/- controls.

Allow tapping the previous weight to copy it into the current set.

Example:

LAST:

35 kg × 9

CURRENT:

Weight [35] kg

Reps [ ]

[USE 35 KG]

==================================================

29. EMPTY STATES

==================================================

For a new user with no workout history:

Show:

"No workout history yet."

"Complete your first workout and your progress will appear here."

Do not show fake charts or fake PRs.

==================================================

30. CHARTS

Use clean, responsive charts.

For exercise progress, default to a line chart.

Example:

INCLINE SMITH MACHINE PRESS

60kg ┤                    ●

57.5kg ┤             ●────

55kg ┤       ●──────

52.5kg ┤ ●───

       └──────────────────

        Jan Feb Mar Apr

Allow metric selection:

Weight

Reps

Estimated 1RM

Volume

Use actual historical logged data.

For bodyweight, use another line chart.

Charts should be readable on mobile.

==================================================

31. PERFORMANCE CALCULATIONS

Where useful, calculate estimated 1RM using a clearly labeled formula.

Do not present estimated 1RM as an actual tested max.

Volume can be calculated as:

weight × reps

For exercises with multiple sets:

sum(weight × reps)

Clearly label it as training volume.

==================================================

32. WORKOUT PLAN FIDELITY

IMPORTANT:

The attached workout-plan.md is the authoritative workout plan.

Preserve:

- Exercise names

- Exercise order

- Set counts

- Rep ranges

- Weekly structure

- Cardio

- Core

- Saturday rotation

- Progression system

- Deload structure

- Lower-back safety rules

Do not silently modify the training program.

If something in the Markdown is ambiguous, preserve the wording and make the UI flexible rather than inventing a new training prescription.

==================================================

33. FIRST-RUN EXPERIENCE

After account creation:

1. Ask for name

2. Ask height

3. Ask current weight

4. Ask units

5. Ask training goal

6. Ask whether they want reminders

7. Show today's workout

8. Explain how logging works with a very short 3-step onboarding

Example:

"See your previous performance."

"Log every set."

"Track your progress."

Then:

[START TODAY'S WORKOUT]

==================================================

34. FINAL QUALITY BAR

This should feel like a real production fitness application.

Prioritize:

- Excellent mobile UX

- Fast set logging

- Persistent data

- Clear exercise instructions

- Previous-set visibility

- Accurate history

- Useful progression charts

- Simple navigation

- Clean visual design

- Reliable authentication

- No fake data

Do not create a static mockup.

Build the actual functioning application with database persistence and authentication.

Start by parsing workout-plan.md into structured workout/exercise data, then build the application around that data.

Before considering the project complete, verify:

- Authentication works

- Data persists after refresh

- Workout sessions save correctly

- Individual sets save correctly

- Previous performance appears during the next workout

- Progress charts use real logged data

- Body metrics persist

- Cardio persists

- Core exercises persist

- Saturday specialization rotation works

- Deload week can be represented

- Mobile logging is fast and usable

- No workout data is lost if the page is refreshed during an unfinished session


below is the workout plan

Build a polished, minimalist workout tracking web app based EXACTLY on the attached workout-plan.md file.

The workout-plan.md is the source of truth for the current training program. Do not remove exercises, change the exercise order, change sets/reps, change the weekly structure, or invent exercises unless explicitly instructed below. The app should turn the Markdown workout plan into an interactive workout logger rather than simply displaying the Markdown.

The app is for a single user initially, but it MUST have a proper authentication system and user-specific persistent data so the architecture can support multiple users later.

==================================================

1. PRODUCT GOAL

==================================================

Create a premium-feeling personal workout dashboard that lets me:

- See today's workout immediately

- Start a workout

- Log every working set

- See what I did in previous sessions for the same exercise

- See suggested weight/reps based on my previous performance

- Record actual weight, reps, RIR and optional notes

- See clear instructions for how to perform every exercise

- Track progressive overload over time

- View strength/progression charts for every exercise

- Track bodyweight, height, waist and other body metrics

- See training history

- See weekly/monthly consistency

- Track cardio and core work

- Easily understand what I need to do next without navigating through complicated screens

The experience should feel like a modern premium fitness app, NOT like a spreadsheet.

==================================================

2. DESIGN DIRECTION

==================================================

Use a minimalist, modern, premium aesthetic.

Think:

- Apple Fitness / Whoop / modern strength-training app

- Clean typography

- Dark-first interface

- Subtle cards

- Lots of whitespace

- Minimal borders

- Muted colors

- One strong accent color

- Smooth but restrained animations

- Large readable numbers

- Excellent mobile experience

Avoid:

- Excessive gradients

- Huge colorful illustrations

- Gamified cartoon UI

- Clutter

- Excessive badges

- Tiny text

- Spreadsheet-like tables as the primary interface

The app should work beautifully on:

- Mobile

- Tablet

- Desktop

Mobile should be treated as a first-class experience because I will likely use the app inside the gym.

==================================================

3. AUTHENTICATION

==================================================

Implement authentication.

Support:

- Sign up

- Login

- Logout

- Forgot password

- Persistent sessions

Use Supabase authentication/database if available.

All workout logs and metrics must belong to the authenticated user.

Never expose another user's data.

Create proper database relationships using user_id.

==================================================

4. INITIAL USER PROFILE

==================================================

Create a profile/settings page.

Store:

- Name

- Height

- Current weight

- Starting weight

- Date of birth / age if provided

- Training experience

- Primary goal

- Optional target body-fat %

- Optional target weight

- Units: kg/lb

- Units: cm/ft-in

- Preferred cardio type

- Preferred rest timer duration

Initially populate the profile using the information provided in the existing context/file only where appropriate, but allow everything to be edited.

Do NOT hard-code these values into the UI.

==================================================

5. DASHBOARD / HOME

==================================================

After login, show a clean dashboard.

Top section:

"Good morning, [Name]"

Then:

TODAY'S WORKOUT

Show:

- Workout name

- Day

- Number of exercises

- Estimated duration

- Start Workout button

Example:

MONDAY

Chest + Side Delts + Triceps

7 exercises

~60–75 min

[ START WORKOUT ]

Below that, show a compact overview:

- Current weight

- Weight change over selected period

- Current streak

- Workouts this week

- Last workout

- Optional waist measurement

Then show:

"Continue where you left off"

if a workout was started but not completed.

==================================================

6. WORKOUT STRUCTURE

==================================================

Parse the attached workout-plan.md and create structured workout data.

The weekly structure must remain exactly as specified in the Markdown.

The app should understand:

- Monday

- Tuesday

- Wednesday

- Thursday

- Friday

- Saturday optional specialization

- Sunday rest

Saturday must preserve the specialization rotation:

Week 1 — Shoulders

Week 2 — Back

Week 3 — Arms

Week 4 — Shoulders

Week 5 — Back

Week 6 — Chest

Week 7 — Shoulders

Week 8 — Back

The user should be able to select the appropriate Saturday specialization.

Do not replace this with a generic workout generator.

==================================================

7. WORKOUT SCREEN

==================================================

When I tap START WORKOUT, open a focused workout interface.

At the top:

- Workout name

- Current day

- Workout timer

- Pause button

- Finish Workout button

Then display exercises sequentially.

Each exercise should have:

Exercise name

Target:

"4 × 8–10"

Rest:

"2–3 min"

RIR:

"1–2"

Previous performance:

"Last time: 35 kg × 9, 9, 8, 8"

Suggested starting weight:

"Try 35 kg"

Then the individual set logger.

==================================================

8. SET LOGGER

==================================================

Each set should be visually represented as a row/card.

Example:

SET 1

Weight

[ 35 ] kg

Reps

[ 9 ]

RIR

[ 2 ]

[ ✓ Complete Set ]

After completing it:

SET 1 ✓

35 kg × 9

RIR 2

Then automatically move focus toward the next set.

Allow editing completed sets.

Support:

- Weight

- Reps

- RIR

- Optional note

RIR should be optional but strongly encouraged for working sets.

Warm-up sets should be supported separately from working sets.

==================================================

9. PREVIOUS PERFORMANCE — VERY IMPORTANT

==================================================

Before each exercise, show my previous performance prominently.

Example:

LAST SESSION

35 kg

9 / 9 / 8 / 8

Average: 8.5 reps

Then show:

SUGGESTION

"Try 35 kg again and aim for 9–10 reps."

The suggestion should NOT blindly increase weight.

Use the workout plan's double-progression philosophy:

If the user reaches the top of the prescribed rep range across all working sets with appropriate RIR, suggest a small weight increase next time.

Example:

Target: 4 × 8–10

Previous:

35 kg

10 / 10 / 10 / 10

Suggestion:

"Increase to 37.5 kg next session."

If performance is lower:

Previous:

35 kg

9 / 9 / 8 / 8

Suggestion:

"Keep 35 kg and try to beat your previous reps."

If the user is cutting and performance is stable or slightly lower, do NOT label it as failure.

Use language such as:

"Strength maintained — good session."

==================================================

10. EXERCISE INSTRUCTIONS

==================================================

Every exercise in the workout plan should have an "How to perform" section.

This should be accessible by tapping:

"How to do it"

For each exercise provide:

- Setup

- Execution

- Breathing

- Key cues

- Common mistakes

- What the exercise should feel like

- Lower-back safety notes where relevant

Keep instructions concise and practical.

Example:

INCLINE SMITH MACHINE PRESS

Setup:

- Set bench to a moderate incline.

- Position yourself so the bar travels naturally toward the upper chest.

Execution:

- Lower under control.

- Keep shoulder blades stable.

- Press upward without losing position.

Cues:

- "Chest up"

- "Control the eccentric"

- "Drive through the palms"

Avoid:

- Excessive shoulder shrugging

- Bouncing the bar

- Excessive arching

Important:

Exercise instructions should correspond to the actual exercise in the workout plan.

Do not invent unnecessary variations.

==================================================

11. REST TIMER

==================================================

After completing a set, show an optional rest timer.

Default according to exercise type:

Compound:

2–3 minutes

Isolation:

60–90 seconds

Allow the user to:

- Start timer

- Skip

- Add 15 seconds

- Subtract 15 seconds

The next set should remain visible while the timer runs.

Example:

REST

01:42

[ +15 ] [ SKIP ]

NEXT:

Set 2

35 kg

Target 8–10 reps

==================================================

12. WORKOUT COMPLETION

==================================================

When I finish the workout, show a simple summary.

Example:

WORKOUT COMPLETE

Chest + Side Delts + Triceps

Duration:

68 min

Exercises:

7

Working sets:

22

Volume:

X kg

PRs:

2

Then ask:

"How did the workout feel?"

Options:

- Great

- Good

- Average

- Poor

Also allow:

Energy:

1–5

Difficulty:

1–5

Optional notes.

Save everything.

==================================================

13. PERSONAL RECORDS

==================================================

Automatically detect useful PRs.

Track:

- Highest weight

- Highest reps at a given weight

- Estimated 1RM where appropriate

- Best total volume

- Best set

- Best workout volume

Do NOT falsely call every heavier weight a PR if reps are dramatically lower.

Display:

NEW PR

Incline Smith Press

60 kg × 10

Small celebratory animation is okay, but keep it minimalist.

==================================================

14. EXERCISE PROGRESS CHARTS

==================================================

Create a dedicated PROGRESS section.

I want to select any exercise.

Example:

[ Incline Smith Machine Press ▼ ]

Then show:

Strength over time

A line chart showing my best performance over time.

Allow toggling between:

- Highest Weight

- Best Reps

- Estimated 1RM

- Volume

The chart should use actual logged data only.

Do not fabricate missing historical data.

Example:

Date | Weight | Reps

Jan 5 | 55 kg | 10

Jan 12 | 57.5 kg | 9

Jan 19 | 57.5 kg | 10

Jan 26 | 60 kg | 8

The chart should clearly show progression.

Also show a small stats section:

BEST WEIGHT

60 kg

BEST REPS

10

BEST EST. 1RM

X

TOTAL SESSIONS

18

LAST PERFORMED

Jan 26

Allow filtering:

- 1 month

- 3 months

- 6 months

- All time

IMPORTANT:

Do not create a single generic chart for the whole workout.

Each exercise needs its own progression history.

==================================================

15. WORKOUT HISTORY

==================================================

Create a HISTORY page.

Show previous workouts as cards:

Jan 26

Chest + Side Delts + Triceps

68 min

22 working sets

2 PRs

Clicking opens the complete historical workout.

Allow me to see:

- Exercise

- Set

- Weight

- Reps

- RIR

- Notes

==================================================

16. BODY METRICS

==================================================

Create a METRICS page.

Track:

- Bodyweight

- Waist

- Optional body-fat estimate

- Height

- Optional chest

- Optional arms

- Optional thighs

Allow manual entries by date.

Show trends.

For bodyweight:

line chart over time.

For waist:

line chart over time.

Also show:

Current

Previous

Change

Example:

WEIGHT

75.4 kg

↓ 0.6 kg

WAIST

79 cm

↓ 1 cm

Do not assume body-fat measurements are accurate.

If entered manually, label them as user-entered estimates.

==================================================

17. WEEKLY TRAINING SUMMARY

==================================================

Create a simple weekly overview.

Show:

Workouts:

4 / 5

Working sets:

XX

Optional Saturday:

Completed / Rest

Cardio:

XX minutes

Core:

XX sessions

PRs:

X

Use a clean visual progress indicator.

==================================================

18. CARDIO LOGGING

==================================================

The workout plan contains cardio.

Allow cardio logging with:

- Type

- Duration

- Distance if applicable

- Incline if applicable

- Speed if applicable

- Average heart rate if available

- Notes

Examples:

Incline treadmill walk

20 min

Bike HIIT

8 rounds

Cardio should appear in workout history.

==================================================

19. ABS / CORE LOGGING

==================================================

Treat core exercises like normal exercises.

Allow logging:

- Exercise

- Sets

- Reps

- Weight where applicable

- RIR

Track progression over time just like other exercises.

==================================================

20. DATA MODEL

==================================================

Use a proper relational database.

Recommended entities:

users

profiles

workout_templates

workout_days

workout_exercises

exercises

workout_sessions

exercise_sessions

sets

body_metrics

cardio_sessions

personal_records

exercise_notes

Each record should have appropriate IDs and timestamps.

All user-generated records must have user_id.

Workout templates can be shared/static, while workout sessions and metrics are user-specific.

Use proper foreign keys.

Do not store the entire workout history as one giant JSON blob.

Individual sets should be queryable.

==================================================

21. EXERCISE DATABASE

==================================================

Create an exercise database based on the exercises in workout-plan.md.

Each exercise should have:

- Name

- Primary muscle

- Secondary muscles

- Exercise category

- Equipment

- Instructions

- Cues

- Common mistakes

- Lower-back considerations

- Default rest period

- Default RIR target

- Rep range

This data should drive the workout UI.

==================================================

22. SMART LOGGING BEHAVIOR

==================================================

The app should learn from my history.

For each exercise:

Show:

LAST TIME

BEST SET

AVERAGE SET

LAST WEIGHT

LAST REPS

Then provide a conservative recommendation.

Examples:

"Repeat 35 kg and try for 1 more rep."

"You're ready to try 37.5 kg."

"Keep the weight. Your performance is stable."

Do NOT aggressively recommend weight increases.

Do NOT automatically change the workout plan.

Recommendations are suggestions only.

==================================================

23. CUT-AWARE TRAINING LOGIC

==================================================

The workout plan is being used during a fat-loss phase.

Therefore, the UI should understand:

"Maintaining strength during a cut is a success."

If performance is slightly lower than the previous workout, do not display negative messaging.

Instead:

"Performance slightly down — normal during a cut. Focus on maintaining technique."

If performance is stable:

"Strength maintained — excellent."

If performance improves:

"New best — great progress."

Keep this encouraging but not gamified.

==================================================

24. SEARCH / NAVIGATION

==================================================

Bottom navigation on mobile:

HOME

WORKOUT

PROGRESS

HISTORY

PROFILE

Desktop can use a left sidebar.

Global quick action:

START TODAY'S WORKOUT

Exercise search should allow quickly finding an exercise and viewing its history.

==================================================

25. SETTINGS

==================================================

Include:

Profile

Units

Rest timer defaults

Notification preferences

Theme

Account

Logout

Dark mode should be the default.

Allow light mode optionally.

==================================================

26. NOTIFICATIONS / REMINDERS

==================================================

If technically appropriate, allow optional reminders.

Examples:

"Today's workout is ready."

"You haven't logged a workout this week."

Do not make notifications annoying.

They should be optional.

==================================================

27. DATA SAFETY

==================================================

Workout data must persist across sessions.

Refreshing the page must NOT lose data.

If a workout is partially completed, automatically save progress.

If the browser closes during a workout, restore the unfinished workout.

Before deleting a workout or metric, ask for confirmation.

Never overwrite previous workout history when editing today's workout.

==================================================

28. UX DETAILS THAT MATTER

The app should make logging extremely fast.

I should be able to:

1. Open app

2. See today's workout

3. Start

4. See previous performance

5. Enter weight/reps

6. Tap complete

7. Rest timer starts

8. Enter next set

9. Finish

10. See progress

with minimal typing.

Use numeric keyboards on mobile for weight/reps.

Remember recently used weights.

Allow quick +/- controls.

Allow tapping the previous weight to copy it into the current set.

Example:

LAST:

35 kg × 9

CURRENT:

Weight [35] kg

Reps [ ]

[USE 35 KG]

==================================================

29. EMPTY STATES

==================================================

For a new user with no workout history:

Show:

"No workout history yet."

"Complete your first workout and your progress will appear here."

Do not show fake charts or fake PRs.

==================================================

30. CHARTS

Use clean, responsive charts.

For exercise progress, default to a line chart.

Example:

INCLINE SMITH MACHINE PRESS

60kg ┤                    ●

57.5kg ┤             ●────

55kg ┤       ●──────

52.5kg ┤ ●───

       └──────────────────

        Jan Feb Mar Apr

Allow metric selection:

Weight

Reps

Estimated 1RM

Volume

Use actual historical logged data.

For bodyweight, use another line chart.

Charts should be readable on mobile.

==================================================

31. PERFORMANCE CALCULATIONS

Where useful, calculate estimated 1RM using a clearly labeled formula.

Do not present estimated 1RM as an actual tested max.

Volume can be calculated as:

weight × reps

For exercises with multiple sets:

sum(weight × reps)

Clearly label it as training volume.

==================================================

32. WORKOUT PLAN FIDELITY

IMPORTANT:

The attached workout-plan.md is the authoritative workout plan.

Preserve:

- Exercise names

- Exercise order

- Set counts

- Rep ranges

- Weekly structure

- Cardio

- Core

- Saturday rotation

- Progression system

- Deload structure

- Lower-back safety rules

Do not silently modify the training program.

If something in the Markdown is ambiguous, preserve the wording and make the UI flexible rather than inventing a new training prescription.

==================================================

33. FIRST-RUN EXPERIENCE

After account creation:

1. Ask for name

2. Ask height

3. Ask current weight

4. Ask units

5. Ask training goal

6. Ask whether they want reminders

7. Show today's workout

8. Explain how logging works with a very short 3-step onboarding

Example:

"See your previous performance."

"Log every set."

"Track your progress."

Then:

[START TODAY'S WORKOUT]

==================================================

34. FINAL QUALITY BAR

This should feel like a real production fitness application.

Prioritize:

- Excellent mobile UX

- Fast set logging

- Persistent data

- Clear exercise instructions

- Previous-set visibility

- Accurate history

- Useful progression charts

- Simple navigation

- Clean visual design

- Reliable authentication

- No fake data

Do not create a static mockup.

Build the actual functioning application with database persistence and authentication.

Start by parsing workout-plan.md into structured workout/exercise data, then build the application around that data.

Before considering the project complete, verify:

- Authentication works

- Data persists after refresh

- Workout sessions save correctly

- Individual sets save correctly

- Previous performance appears during the next workout

- Progress charts use real logged data

- Body metrics persist

- Cardio persists

- Core exercises persist

- Saturday specialization rotation works

- Deload week can be represented

- Mobile logging is fast and usable

- No workout data is lost if the page is refreshed during an unfinished session

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
