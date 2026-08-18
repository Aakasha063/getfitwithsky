// Shared workout data + business logic for LIFT recreation/redesign DCs.
export const EXERCISES = {
  "incline-smith-press": { name: "Incline Smith Machine Press", muscle: "Upper chest", equip: "Smith machine", compound: true,
    setup: ["Bench at roughly 30 degrees under the bar.", "Grip slightly wider than shoulder width."],
    exec: ["Lower under control to just above the upper chest over 2-3 seconds.", "Press back up without locking out hard."],
    cues: ["Chest up, shoulder blades pulled down and back.", "Keep constant tension - stop just short of lockout."],
    mistakes: ["Bench angle too steep (turns it into a shoulder press).", "Bouncing the bar off the chest."],
    feel: "A deep stretch and contraction across the upper chest, not the front delts.", breathe: "Inhale on the way down, exhale as you press." },
  "flat-machine-chest-press": { name: "Flat Machine Chest Press", muscle: "Chest", equip: "Machine", compound: true,
    setup: ["Set the seat so the handles line up with mid-chest.", "Plant feet, sit tall against the pad."],
    exec: ["Press out until arms are nearly straight.", "Return slowly until you feel a stretch across the chest."],
    cues: ["Shoulder blades stay retracted against the pad.", "Squeeze the chest at the end of each press."],
    mistakes: ["Seat set too high or too low.", "Shrugging the shoulders forward at lockout."],
    feel: "Chest working through the full range with no shoulder pinching.", breathe: "Exhale on the press." },
  "lateral-raise-machine": { name: "Lateral Raise Machine", muscle: "Side delts", equip: "Machine", compound: false,
    setup: ["Adjust the seat so the pivot lines up with your shoulder joint."], exec: ["Drive the elbows out and up to about shoulder height.", "Lower slowly, resisting the whole way."],
    cues: ["Lead with the elbows, not the hands."], mistakes: ["Using momentum or leaning back."],
    feel: "A burn on the outside of the shoulder.", breathe: "Exhale as you raise." },
  "pec-deck": { name: "Pec Deck", muscle: "Chest", equip: "Machine", compound: false,
    setup: ["Seat height so handles sit at chest level."], exec: ["Bring the handles together in a wide arc.", "Hold the squeeze briefly, then open slowly into a stretch."],
    cues: ["Think about hugging, not pushing."], mistakes: ["Bending and straightening the elbows (turns it into a press)."],
    feel: "A strong squeeze in the mid-chest and a stretch at the end range.", breathe: "Exhale as you close." },
  "overhead-cable-triceps-extension": { name: "Overhead Cable Triceps Extension", muscle: "Triceps", equip: "Cable", compound: false,
    setup: ["Set the pulley low-to-mid, attach a rope."], exec: ["Start with hands behind the head, elbows high.", "Extend fully overhead, then lower under control into a deep stretch."],
    cues: ["Keep the elbows pointing forward and pinned."], mistakes: ["Elbows drifting wide."],
    feel: "A long stretch down the back of the arm.", breathe: "Exhale as you extend." },
  "rope-pushdown": { name: "Rope Pushdown", muscle: "Triceps", equip: "Cable", compound: false,
    setup: ["High pulley with a rope, slight forward lean, elbows tucked."], exec: ["Push down and spread the rope at the bottom.", "Return slowly to about 90 degrees."],
    cues: ["Elbows stay glued to the sides."], mistakes: ["Using bodyweight to drive the rope down."],
    feel: "A hard contraction in the triceps at lockout.", breathe: "Exhale as you push down." },
  "pallof-press": { name: "Pallof Press", muscle: "Core", equip: "Cable", compound: false,
    setup: ["Cable at chest height, stand side-on."], exec: ["Press the handle straight out and resist the rotation.", "Hold 1-2 seconds, return under control."],
    cues: ["Ribs down, glutes lightly braced."], mistakes: ["Leaning away from the cable."],
    feel: "Deep tension through the obliques and the whole trunk.", breathe: "Exhale slowly as you press out.", back: "Keep a neutral spine - this is an anti-rotation drill, not a twist." },
  "incline-treadmill-walk": { name: "Incline Treadmill Walk", muscle: "Cardio", equip: "Treadmill", compound: false, cardio: true,
    setup: ["Set a moderate incline (8-12%) and a walking pace."], exec: ["Walk steadily for the prescribed duration."],
    cues: ["Breathing harder but still able to speak in short sentences."], mistakes: ["Hanging off the handrails."],
    feel: "Elevated breathing, sustainable effort.", breathe: "Breathe steadily through the nose and mouth." },
  "wide-grip-lat-pulldown": { name: "Wide-Grip Lat Pulldown", muscle: "Lats", equip: "Cable", compound: true,
    setup: ["Grip wider than shoulder width, thumbs over the bar."], exec: ["Pull the elbows down and slightly back to the upper chest.", "Control the bar all the way up into a full stretch."],
    cues: ["Think elbows to hips, not hands to chest."], mistakes: ["Leaning back excessively and rowing."],
    feel: "A wide stretch and contraction through the lats.", breathe: "Exhale as you pull down." },
  "chest-supported-row": { name: "Chest-Supported Row", muscle: "Mid back", equip: "Machine", compound: true,
    setup: ["Chest firmly on the pad, feet planted."], exec: ["Row the handles toward the lower ribs.", "Pause briefly, then let the weight stretch the back."],
    cues: ["Chest stays glued to the pad."], mistakes: ["Peeling off the pad to cheat weight up."],
    feel: "Squeeze between the shoulder blades and through the lats.", breathe: "Exhale as you row.", back: "Chest support keeps the lower back out of it - keep it that way." },
  "straight-arm-pulldown": { name: "Straight-Arm Pulldown", muscle: "Lats", equip: "Cable", compound: false,
    setup: ["High pulley, hinge slightly at the hips, soft elbows locked in place."], exec: ["Sweep the bar down to the thighs in an arc.", "Return slowly overhead until the lats stretch."],
    cues: ["Elbow angle never changes."], mistakes: ["Turning it into a pushdown by bending the arms."],
    feel: "A long contraction down the sides of the back.", breathe: "Exhale as you sweep down." },
  "rear-delt-fly": { name: "Rear-Delt Fly", muscle: "Rear delts", equip: "Machine", compound: false,
    setup: ["Chest on the pad, handles set for a wide arc."], exec: ["Sweep the arms out and back.", "Return slowly without letting the plates touch."],
    cues: ["Lead with the elbows and pinkies."], mistakes: ["Using too much weight and rowing."],
    feel: "A burn across the back of the shoulders.", breathe: "Exhale as you open." },
  "face-pull": { name: "Face Pull", muscle: "Rear delts", equip: "Cable", compound: false,
    setup: ["Rope at upper-chest / face height, split stance."], exec: ["Pull the rope toward the forehead, hands separating.", "Externally rotate so knuckles finish facing back."],
    cues: ["High elbows throughout."], mistakes: ["Pulling too heavy and turning it into a row."],
    feel: "Rear delts and upper back, plus shoulder-health work.", breathe: "Exhale as you pull." },
  "incline-dumbbell-curl": { name: "Incline Dumbbell Curl", muscle: "Biceps", equip: "Dumbbell", compound: false,
    setup: ["Bench at roughly 45-60 degrees, arms hanging straight down."], exec: ["Curl up while keeping the upper arm still.", "Lower all the way to a full stretch."],
    cues: ["The stretched position is the whole point - do not shorten it."], mistakes: ["Swinging the elbows forward."],
    feel: "A deep stretch and hard peak contraction in the biceps.", breathe: "Exhale as you curl." },
  "hanging-knee-raise": { name: "Hanging Knee Raise", muscle: "Core", equip: "Bodyweight", compound: false,
    setup: ["Hang from a bar with a solid grip. Let the body settle - no swing."], exec: ["Raise the knees toward the chest, curling the pelvis up.", "Lower slowly with control."],
    cues: ["Curl the pelvis, do not just lift the legs."], mistakes: ["Using momentum."],
    feel: "Lower abs contracting hard.", breathe: "Exhale as you raise the knees.", back: "Avoid arching the lower back on the way down." },
  "cable-crunch": { name: "Cable Crunch", muscle: "Abs", equip: "Cable", compound: false,
    setup: ["Kneel below a high pulley with a rope at the head."], exec: ["Curl the torso down, bringing ribs toward pelvis.", "Return slowly under tension."],
    cues: ["Curl the spine, do not hinge at the hips."], mistakes: ["Pulling the cable down with the arms."],
    feel: "Abs shortening under load.", breathe: "Exhale hard as you crunch down." },
  "leg-press": { name: "Leg Press", muscle: "Quads", equip: "Machine", compound: true,
    setup: ["Feet shoulder width, mid-platform, back flat against the pad."], exec: ["Lower under control to a depth where the pelvis stays neutral.", "Press back up without locking the knees hard."],
    cues: ["Push through the whole foot."], mistakes: ["Chasing depth and letting the pelvis round."],
    feel: "Quads and glutes loaded, lower back completely uninvolved.", breathe: "Inhale down, exhale up.", back: "Do not chase depth - if the pelvis begins to round, stop the rep shorter." },
  "smith-hack-squat": { name: "Smith Hack Squat", muscle: "Quads", equip: "Smith machine", compound: true,
    setup: ["Feet slightly forward of the bar, bar across the upper traps."], exec: ["Sit down and back under control.", "Drive up through the heels and mid-foot."],
    cues: ["Keep the pelvis controlled."], mistakes: ["Letting the lower back round at the bottom."],
    feel: "Quads doing the work with a stable, pain-free lower back.", breathe: "Inhale down, exhale up.", back: "Do not chase depth if your lower back starts rounding." },
  "leg-curl": { name: "Seated/Lying Leg Curl", muscle: "Hamstrings", equip: "Machine", compound: false,
    setup: ["Align the knee joint with the machine pivot."], exec: ["Curl the weight fully.", "Lower over 2-3 seconds with control."],
    cues: ["Controlled eccentric on every rep."], mistakes: ["Letting the weight drop back."],
    feel: "Hamstrings contracting and stretching hard.", breathe: "Exhale as you curl." },
  "bulgarian-split-squat": { name: "Bulgarian Split Squat", muscle: "Quads", equip: "Dumbbell", compound: true,
    setup: ["Rear foot on a bench, front foot far enough forward."], exec: ["Lower straight down until the front thigh is near parallel.", "Drive up through the front foot."],
    cues: ["Front knee tracks over the toes."], mistakes: ["Stance too short - knee gets crushed forward."],
    feel: "Front-leg quad and glute working with a balance challenge.", breathe: "Inhale down, exhale up.", back: "Keep the trunk braced and the spine neutral." },
  "leg-extension": { name: "Leg Extension", muscle: "Quads", equip: "Machine", compound: false,
    setup: ["Knee pivot aligned with the machine, pad on the lower shins."], exec: ["Extend fully and pause briefly.", "Lower slowly."],
    cues: ["Squeeze at the top of every rep."], mistakes: ["Slamming into lockout."],
    feel: "A hard quad burn.", breathe: "Exhale as you extend." },
  "standing-calf-raise": { name: "Standing Calf Raise", muscle: "Calves", equip: "Machine", compound: false,
    setup: ["Balls of the feet on the platform, heels free."], exec: ["Rise as high as possible onto the toes.", "Lower into a deep stretch and pause."],
    cues: ["Pause 1 second at both ends."], mistakes: ["Short, bouncy reps."],
    feel: "A strong stretch and cramp-like contraction in the calves.", breathe: "Exhale as you rise." },
  "seated-dumbbell-shoulder-press": { name: "Seated Dumbbell Shoulder Press", muscle: "Front delts", equip: "Dumbbell", compound: true,
    setup: ["Upright bench with back support, dumbbells at shoulder height."], exec: ["Press up and slightly in without clashing the bells.", "Lower to about ear level under control."],
    cues: ["Ribs down - do not arch to press."], mistakes: ["Excessive lower-back arch."],
    feel: "Delts loaded, with triceps finishing the press.", breathe: "Exhale as you press.", back: "Keep the ribcage down and the lower back on the pad." },
  "cable-lateral-raise": { name: "Cable Lateral Raise", muscle: "Side delts", equip: "Cable", compound: false,
    setup: ["Low pulley behind or across the body, D-handle."], exec: ["Raise the arm out to shoulder height.", "Lower slowly against constant tension."],
    cues: ["Lead with the elbow."], mistakes: ["Swinging the torso."],
    feel: "Constant tension burn on the side delt.", breathe: "Exhale as you raise." },
  "rear-delt-cable-fly": { name: "Rear-Delt Cable Fly", muscle: "Rear delts", equip: "Cable", compound: false,
    setup: ["Cables set at shoulder height, crossed in front."], exec: ["Sweep the arms out and back in a wide arc.", "Return under control."],
    cues: ["Think of pulling the arms apart, not back."], mistakes: ["Bending the elbows into a row."],
    feel: "Isolated rear-delt burn.", breathe: "Exhale as you open." },
  "triceps-press-machine": { name: "Triceps Press Machine", muscle: "Triceps", equip: "Machine", compound: false,
    setup: ["Seat set so elbows align with the pivot."], exec: ["Press to full extension.", "Return slowly to a stretch."],
    cues: ["Elbows stay fixed."], mistakes: ["Using the shoulders to push."],
    feel: "Triceps working through the full range.", breathe: "Exhale as you press." },
  "ez-bar-preacher-curl": { name: "EZ-Bar / Preacher Curl", muscle: "Biceps", equip: "EZ bar", compound: false,
    setup: ["Armpits over the top of the preacher pad."], exec: ["Curl up to a hard squeeze.", "Lower fully, slowly, into the stretch."],
    cues: ["Never drop the bar at the bottom."], mistakes: ["Bouncing out of the stretched position."],
    feel: "Biceps under tension the entire set.", breathe: "Exhale as you curl." },
  "hammer-curl": { name: "Hammer Curl", muscle: "Brachialis", equip: "Dumbbell", compound: false,
    setup: ["Neutral grip, dumbbells at the sides."], exec: ["Curl up keeping the palms facing in.", "Lower under control."],
    cues: ["No swinging - keep the torso still."], mistakes: ["Using the hips to start the rep."],
    feel: "Outer arm and forearm working.", breathe: "Exhale as you curl." },
  "incline-dumbbell-press": { name: "Incline Dumbbell Press", muscle: "Upper chest", equip: "Dumbbell", compound: true,
    setup: ["Bench at roughly 30 degrees."], exec: ["Lower to a stretch beside the upper chest.", "Press up and slightly together."],
    cues: ["Shoulder blades pinned back and down."], mistakes: ["Too steep an incline."],
    feel: "Upper chest stretch and contraction.", breathe: "Inhale down, exhale up." },
  "neutral-grip-lat-pulldown": { name: "Neutral-Grip Lat Pulldown", muscle: "Lats", equip: "Cable", compound: true,
    setup: ["Neutral (palms facing) handle, thighs under the pad."], exec: ["Pull the handles to the upper chest.", "Control the full stretch overhead."],
    cues: ["Depress the shoulder blades first."], mistakes: ["Excessive lean-back."],
    feel: "Thick lat contraction with less biceps strain.", breathe: "Exhale as you pull." },
  "cable-chest-fly": { name: "Cable Chest Fly", muscle: "Chest", equip: "Cable", compound: false,
    setup: ["Pulleys set at or slightly above shoulder height."], exec: ["Bring the hands together in front of the chest.", "Open slowly into a controlled stretch."],
    cues: ["Fixed elbow angle throughout."], mistakes: ["Pressing instead of flying."],
    feel: "A wide chest stretch and squeeze.", breathe: "Exhale as you close." },
  "hip-thrust": { name: "Hip Thrust", muscle: "Glutes", equip: "Barbell", compound: true,
    setup: ["Upper back on a bench, bar padded across the hips."], exec: ["Drive the hips up until the torso is parallel to the floor.", "Pause and squeeze, then lower under control."],
    cues: ["Finish with glutes, not with lower-back extension."], mistakes: ["Hyperextending the lower back at the top."],
    feel: "Glutes doing all the work at lockout.", breathe: "Exhale as you drive up.", back: "Keep ribs down and avoid excessive lower-back extension - this is your primary hip-extension movement." },
  "machine-shoulder-press": { name: "Machine Shoulder Press", muscle: "Front delts", equip: "Machine", compound: true,
    setup: ["Seat height so handles sit near shoulder level."], exec: ["Press overhead without hard lockout.", "Lower under control to a stretch."],
    cues: ["Ribs down, core braced."], mistakes: ["Arching off the pad."],
    feel: "Delts loaded through the full press.", breathe: "Exhale as you press." },
  "pull-ups": { name: "Pull-ups / Assisted Pull-ups", muscle: "Lats", equip: "Bodyweight", compound: true,
    setup: ["Grip slightly wider than shoulder width, hang with active shoulders."], exec: ["Pull the chest toward the bar, elbows down.", "Lower to a full hang with control."],
    cues: ["Start each rep by pulling the shoulder blades down."], mistakes: ["Kipping or swinging."],
    feel: "Lats and upper back working hard.", breathe: "Exhale as you pull up." },
  "ez-bar-curl": { name: "EZ-Bar Curl", muscle: "Biceps", equip: "EZ bar", compound: false,
    setup: ["Shoulder-width angled grip, elbows at the sides."], exec: ["Curl up without moving the elbows.", "Lower fully under control."],
    cues: ["No hip drive."], mistakes: ["Swinging the bar up."],
    feel: "Full biceps contraction with comfortable wrists.", breathe: "Exhale as you curl.", back: "Keep the torso still - no leaning back." },
  "incline-machine-press": { name: "Incline Machine Press", muscle: "Upper chest", equip: "Machine", compound: true,
    setup: ["Seat so handles align with the upper chest."], exec: ["Press out to near lockout.", "Return slowly to a stretch."],
    cues: ["Keep the shoulder blades retracted."], mistakes: ["Seat too low, turning it into a shoulder press."],
    feel: "Upper chest loaded with a stable path.", breathe: "Exhale as you press." },
  "weighted-chest-dips": { name: "Weighted Chest Dips", muscle: "Chest", equip: "Bodyweight", compound: true,
    setup: ["Slight forward lean on the bars, add weight via belt if available."], exec: ["Lower until you feel a solid chest stretch.", "Press back up without locking out hard."],
    cues: ["Lean forward to bias the chest."], mistakes: ["Dropping too deep and straining the shoulder."],
    feel: "A deep chest stretch and press.", breathe: "Inhale down, exhale up." },
  "push-ups": { name: "Push-ups", muscle: "Chest", equip: "Bodyweight", compound: false,
    setup: ["Hands slightly wider than shoulders, body in one straight line."], exec: ["Lower the chest to just above the floor.", "Press up while keeping the trunk rigid."],
    cues: ["Stop about 1 rep before failure."], mistakes: ["Sagging hips."],
    feel: "Chest and triceps finishing burn.", breathe: "Exhale as you press up.", back: "Brace the core - no sagging through the lower back." },
};

function ex(slug, sets, repRange, repMin, repMax, rir, restNote, restSeconds, notes) {
  return { slug, sets, repRange, repMin, repMax, rir, restNote, restSeconds, notes: notes || null };
}

export const DAYS = [
  { slug: "monday", name: "Monday", focus: "Chest + Side Delts + Triceps", dow: 1, isRest: false, isOptional: false,
    cardioNote: "Incline treadmill walk 15-20 min", estMin: 60, estMax: 75,
    exercises: [
      ex("incline-smith-press", 4, "8-10", 8, 10, "1-2", "2-3 min", 180, "Starting weight: ~60 kg"),
      ex("flat-machine-chest-press", 3, "8-12", 8, 12, "1-2", "2 min", 120, "Starting weight: ~75 kg"),
      ex("lateral-raise-machine", 4, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("pec-deck", 3, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("overhead-cable-triceps-extension", 3, "10-12", 10, 12, "0-1", "60-90 sec", 75),
      ex("rope-pushdown", 3, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("pallof-press", 3, "12/side", 12, 12, "1-2", "60 sec", 60),
      ex("incline-treadmill-walk", 1, "15-20 min", null, null, null, null, 0, "Moderate intensity."),
    ] },
  { slug: "tuesday", name: "Tuesday", focus: "Back Width + Rear Delts + Biceps", dow: 2, isRest: false, isOptional: false, estMin: 60, estMax: 75,
    exercises: [
      ex("wide-grip-lat-pulldown", 4, "8-10", 8, 10, "1-2", "2-3 min", 180, "Starting weight: ~79-86 kg"),
      ex("chest-supported-row", 4, "8-12", 8, 12, "1-2", "2 min", 120, "Starting weight: ~40 kg"),
      ex("straight-arm-pulldown", 3, "12-15", 12, 15, "0-1", "60-90 sec", 75, "Starting weight: ~45 kg"),
      ex("rear-delt-fly", 4, "12-15", 12, 15, "0-1", "60-90 sec", 75, "Starting weight: ~55 kg"),
      ex("face-pull", 2, "15-20", 15, 20, "0-1", "60 sec", 60),
      ex("incline-dumbbell-curl", 3, "8-12", 8, 12, "0-1", "90 sec", 90, "Starting weight: ~15 kg"),
      ex("hanging-knee-raise", 3, "10-15", 10, 15, "0-1", "60 sec", 60),
      ex("cable-crunch", 3, "10-15", 10, 15, "0-1", "60 sec", 60),
    ] },
  { slug: "wednesday", name: "Wednesday", focus: "Legs + Abs + Cardio", dow: 3, isRest: false, isOptional: false,
    cardioNote: "Incline treadmill walk 20 min", estMin: 65, estMax: 80,
    exercises: [
      ex("leg-press", 4, "8-12", 8, 12, "1-2", "2-3 min", 180, "Starting weight: ~150 kg"),
      ex("smith-hack-squat", 3, "8-10", 8, 10, "1-2", "2-3 min", 180, "Starting weight: ~50 kg"),
      ex("leg-curl", 4, "10-12", 10, 12, "0-1", "90 sec", 90, "Controlled eccentric"),
      ex("bulgarian-split-squat", 3, "8-10 / leg", 8, 10, "1-2", "90-120 sec", 105, "Starting weight: ~15 kg"),
      ex("leg-extension", 3, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("standing-calf-raise", 4, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("hanging-knee-raise", 3, "10-15", 10, 15, "0-1", "60 sec", 60, "Controlled. No swinging."),
      ex("cable-crunch", 3, "10-15", 10, 15, "0-1", "60 sec", 60),
      ex("incline-treadmill-walk", 1, "20 min", null, null, null, null, 0),
    ] },
  { slug: "thursday", name: "Thursday", focus: "Shoulders + Arms", dow: 4, isRest: false, isOptional: false, estMin: 55, estMax: 70,
    notes: "Final lateral raise set can be a controlled drop set.",
    exercises: [
      ex("seated-dumbbell-shoulder-press", 4, "8-10", 8, 10, "1-2", "2-3 min", 180, "Starting weight: ~35 kg"),
      ex("cable-lateral-raise", 4, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("rear-delt-cable-fly", 3, "15-20", 15, 20, "0-1", "60-90 sec", 60),
      ex("triceps-press-machine", 3, "10-12", 10, 12, "0-1", "60-90 sec", 75),
      ex("ez-bar-preacher-curl", 3, "10-12", 10, 12, "0-1", "90 sec", 90, "Starting point: ~12.5 kg EZ-bar"),
      ex("overhead-cable-triceps-extension", 3, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("hammer-curl", 2, "10-12", 10, 12, "0-1", "60-90 sec", 75),
      ex("lateral-raise-machine", 2, "15-20", 15, 20, "0", "60 sec", 60, "Lateral raise finisher. Final set can be a controlled drop set."),
    ] },
  { slug: "friday", name: "Friday", focus: "Upper + Posterior Chain + Abs + Cardio", dow: 5, isRest: false, isOptional: false,
    cardioNote: "Incline treadmill walk 20 min", estMin: 70, estMax: 85,
    exercises: [
      ex("incline-dumbbell-press", 3, "8-10", 8, 10, "1-2", "2-3 min", 180, "Starting weight: ~35 kg"),
      ex("neutral-grip-lat-pulldown", 4, "8-10", 8, 10, "1-2", "2-3 min", 150),
      ex("cable-chest-fly", 3, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("chest-supported-row", 3, "8-12", 8, 12, "1-2", "2 min", 120),
      ex("hip-thrust", 3, "8-12", 8, 12, "1-2", "2 min", 120, "Keep ribs down. Avoid excessive lower-back extension."),
      ex("lateral-raise-machine", 3, "15-20", 15, 20, "0-1", "60-90 sec", 60, "Use a lighter weight than Monday."),
      ex("standing-calf-raise", 4, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("hanging-knee-raise", 3, "10-15", 10, 15, "0-1", "60 sec", 60),
      ex("pallof-press", 3, "12/side", 12, 12, "1-2", "60 sec", 60),
      ex("incline-treadmill-walk", 1, "20 min", null, null, null, null, 0),
    ] },
  { slug: "sunday", name: "Sunday", focus: "Complete Rest", dow: 0, isRest: true, isOptional: false,
    cardioNote: "Easy walking only", notes: "Easy walking, light mobility, stretching if desired. No hard training, no HIIT." },
];

export const SATURDAYS = [
  { slug: "saturday-shoulders", spec: "shoulders", label: "Shoulders", rotation: "Weeks 1, 4 and 7 of the rotation.", estMin: 40, estMax: 55,
    exercises: [
      ex("machine-shoulder-press", 3, "8-10", 8, 10, "1-2", "2-3 min", 150),
      ex("cable-lateral-raise", 4, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("lateral-raise-machine", 3, "15-20", 15, 20, "0-1", "60-90 sec", 60),
      ex("rear-delt-fly", 4, "15-20", 15, 20, "0-1", "60-90 sec", 60),
      ex("face-pull", 3, "15-20", 15, 20, "0-1", "60 sec", 60),
      ex("incline-treadmill-walk", 1, "15-20 min", null, null, null, null, 0),
    ] },
  { slug: "saturday-back", spec: "back", label: "Back", rotation: "Weeks 2, 5 and 8 of the rotation.", estMin: 40, estMax: 55,
    exercises: [
      ex("pull-ups", 4, "6-10", 6, 10, "1-2", "2-3 min", 180),
      ex("neutral-grip-lat-pulldown", 4, "8-12", 8, 12, "1-2", "2-3 min", 150),
      ex("chest-supported-row", 3, "8-12", 8, 12, "1-2", "2 min", 120),
      ex("straight-arm-pulldown", 3, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("rear-delt-fly", 3, "15-20", 15, 20, "0-1", "60-90 sec", 60),
      ex("incline-treadmill-walk", 1, "15-20 min", null, null, null, null, 0),
    ] },
  { slug: "saturday-arms", spec: "arms", label: "Arms", rotation: "Week 3 of the rotation.", estMin: 40, estMax: 55,
    exercises: [
      ex("ez-bar-curl", 3, "8-10", 8, 10, "1-2", "90 sec", 90),
      ex("incline-dumbbell-curl", 3, "10-12", 10, 12, "0-1", "90 sec", 90),
      ex("hammer-curl", 3, "10-12", 10, 12, "0-1", "60-90 sec", 75),
      ex("triceps-press-machine", 4, "8-10", 8, 10, "1-2", "90 sec", 90),
      ex("rope-pushdown", 3, "10-15", 10, 15, "0-1", "60-90 sec", 75),
      ex("overhead-cable-triceps-extension", 3, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("incline-treadmill-walk", 1, "15-20 min", null, null, null, null, 0),
    ] },
  { slug: "saturday-chest", spec: "chest", label: "Chest", rotation: "Week 6 of the rotation.", estMin: 40, estMax: 55,
    exercises: [
      ex("incline-machine-press", 4, "8-10", 8, 10, "1-2", "2-3 min", 180),
      ex("pec-deck", 3, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("cable-chest-fly", 3, "12-15", 12, 15, "0-1", "60-90 sec", 75),
      ex("weighted-chest-dips", 3, "8-10", 8, 10, "1-2", "2-3 min", 150),
      ex("push-ups", 2, "To ~1 RIR", null, null, "1", "60 sec", 60, "Stop about 1 rep before failure."),
      ex("incline-treadmill-walk", 1, "15-20 min", null, null, null, null, 0),
    ] },
];

export const PROFILE = { name: "Sam Rivera", email: "sam.rivera@example.com", goal: "Fat loss", experience: "Intermediate",
  heightCm: 178, startWeightKg: 88, currentWeightKg: 80.4 };

export const BODY_METRICS = [
  { date: "2026-06-15", weightKg: 88.0, waistCm: 92 },
  { date: "2026-06-22", weightKg: 87.1, waistCm: 91 },
  { date: "2026-06-29", weightKg: 86.3, waistCm: 90 },
  { date: "2026-07-06", weightKg: 85.4, waistCm: 89 },
  { date: "2026-07-13", weightKg: 84.8, waistCm: 88 },
  { date: "2026-07-20", weightKg: 83.9, waistCm: 87 },
  { date: "2026-07-27", weightKg: 83.1, waistCm: 86 },
  { date: "2026-08-03", weightKg: 82.0, waistCm: 85 },
  { date: "2026-08-10", weightKg: 81.2, waistCm: 84 },
  { date: "2026-08-17", weightKg: 80.4, waistCm: 84 },
];

export const PREVIOUS = {
  "incline-smith-press": { date: "2026-08-10", sets: [{ w: 55, r: 10 }, { w: 55, r: 10 }, { w: 55, r: 9 }, { w: 55, r: 9 }] },
  "flat-machine-chest-press": { date: "2026-08-10", sets: [{ w: 72.5, r: 11 }, { w: 72.5, r: 10 }, { w: 72.5, r: 9 }] },
  "lateral-raise-machine": { date: "2026-08-10", sets: [{ w: 18, r: 15 }, { w: 18, r: 14 }, { w: 18, r: 13 }, { w: 18, r: 12 }] },
  "wide-grip-lat-pulldown": { date: "2026-08-11", sets: [{ w: 82, r: 10 }, { w: 82, r: 9 }, { w: 82, r: 9 }, { w: 82, r: 8 }] },
  "leg-press": { date: "2026-08-12", sets: [{ w: 145, r: 12 }, { w: 145, r: 11 }, { w: 145, r: 10 }, { w: 145, r: 10 }] },
};

export const HISTORY = [
  { id: "s10", date: "2026-08-15", title: "Friday — Upper + Posterior Chain + Abs + Cardio", durationSeconds: 4380, status: "completed", workingSets: 24, prs: 0 },
  { id: "s9", date: "2026-08-13", title: "Wednesday — Legs + Abs + Cardio", durationSeconds: 4620, status: "completed", workingSets: 26, prs: 1 },
  { id: "s8", date: "2026-08-12", title: "Tuesday — Back Width + Rear Delts + Biceps", durationSeconds: 4140, status: "completed", workingSets: 24, prs: 0 },
  { id: "s7", date: "2026-08-11", title: "Monday — Chest + Side Delts + Triceps", durationSeconds: 4080, status: "completed", workingSets: 22, prs: 2 },
  { id: "s6", date: "2026-08-08", title: "Friday — Upper + Posterior Chain + Abs + Cardio", durationSeconds: 4500, status: "completed", workingSets: 24, prs: 0 },
  { id: "s5", date: "2026-08-06", title: "Wednesday — Legs + Abs + Cardio", durationSeconds: 4560, status: "completed", workingSets: 26, prs: 0 },
  { id: "s4", date: "2026-08-05", title: "Tuesday — Back Width + Rear Delts + Biceps", durationSeconds: 4020, status: "completed", workingSets: 24, prs: 1 },
  { id: "s3", date: "2026-08-04", title: "Monday — Chest + Side Delts + Triceps", durationSeconds: 4200, status: "completed", workingSets: 22, prs: 0 },
];

export const SESSION_DETAIL = {
  id: "s7", date: "2026-08-11", title: "Monday — Chest + Side Delts + Triceps", durationSeconds: 4080, status: "completed",
  energy: 4, difficulty: 3, mood: "Great",
  exercises: [
    { name: "Incline Smith Machine Press", muscle: "Upper chest", targetRepRange: "8-10", sets: [
      { setNumber: 1, weightKg: 57.5, reps: 10, rir: 2 }, { setNumber: 2, weightKg: 57.5, reps: 10, rir: 1 },
      { setNumber: 3, weightKg: 57.5, reps: 10, rir: 1 }, { setNumber: 4, weightKg: 57.5, reps: 9, rir: 1 } ] },
    { name: "Flat Machine Chest Press", muscle: "Chest", targetRepRange: "8-12", sets: [
      { setNumber: 1, weightKg: 75, reps: 11, rir: 2 }, { setNumber: 2, weightKg: 75, reps: 10, rir: 1 }, { setNumber: 3, weightKg: 75, reps: 9, rir: 1 } ] },
    { name: "Lateral Raise Machine", muscle: "Side delts", targetRepRange: "12-15", sets: [
      { setNumber: 1, weightKg: 18, reps: 15, rir: 1 }, { setNumber: 2, weightKg: 18, reps: 14, rir: 0 },
      { setNumber: 3, weightKg: 18, reps: 13, rir: 0 }, { setNumber: 4, weightKg: 18, reps: 12, rir: 0 } ] },
  ],
  prs: [{ exercise: "Incline Smith Machine Press", detail: "est. 1RM 76.7 kg (57.5 kg × 10)" }, { exercise: "Flat Machine Chest Press", detail: "best volume 825 kg" }],
  cardio: [{ type: "Incline treadmill walk", minutes: 18 }],
  notes: "Felt strong on the press today, kept RIR honest on the last set.",
};

export const PRS = [
  { id: "pr1", exercise: "Incline Smith Machine Press", date: "2026-08-11", type: "strength", weightKg: 57.5, reps: 10 },
  { id: "pr2", exercise: "Flat Machine Chest Press", date: "2026-08-11", type: "volume", volumeKg: 825 },
  { id: "pr3", exercise: "Wide-Grip Lat Pulldown", date: "2026-08-13", type: "strength", weightKg: 84, reps: 8 },
  { id: "pr4", exercise: "Leg Press", date: "2026-08-13", type: "strength", weightKg: 150, reps: 10 },
];

export const STRENGTH_HISTORY = {
  "incline-smith-press": [
    { date: "2026-07-14", e1rm: 62.3 }, { date: "2026-07-21", e1rm: 64.2 }, { date: "2026-07-28", e1rm: 66.0 },
    { date: "2026-08-04", e1rm: 68.5 }, { date: "2026-08-11", e1rm: 76.7 },
  ],
  "wide-grip-lat-pulldown": [
    { date: "2026-07-14", e1rm: 88.0 }, { date: "2026-07-21", e1rm: 90.5 }, { date: "2026-07-28", e1rm: 92.0 },
    { date: "2026-08-05", e1rm: 95.0 }, { date: "2026-08-13", e1rm: 104.4 },
  ],
  "leg-press": [
    { date: "2026-07-15", e1rm: 178 }, { date: "2026-07-22", e1rm: 182 }, { date: "2026-07-29", e1rm: 186 },
    { date: "2026-08-06", e1rm: 189 }, { date: "2026-08-13", e1rm: 200 },
  ],
};

export const LEADERBOARD = [
  { userId: "me", name: "Sam Rivera", totalVolume: 128400, setsCount: 412, sessions: 26, activeWeeks: 8 },
  { userId: "u2", name: "Jamie Ortiz", totalVolume: 151200, setsCount: 448, sessions: 28, activeWeeks: 8 },
  { userId: "u3", name: "Priya Nair", totalVolume: 96800, setsCount: 360, sessions: 22, activeWeeks: 7 },
  { userId: "u4", name: "Diego Fuentes", totalVolume: 84200, setsCount: 305, sessions: 19, activeWeeks: 6 },
  { userId: "u5", name: "Wren Kelly", totalVolume: 71500, setsCount: 288, sessions: 18, activeWeeks: 6 },
];

export function fmtDuration(seconds) {
  if (!seconds) return "0m";
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
export function mmss(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
export function epley1RM(weight, reps) { return weight * (1 + reps / 30); }

export function suggestNextSet({ prevSets, setNumber, repMin, repMax, isCompound }) {
  const working = (prevSets || []).filter((s) => (s.r ?? 0) > 0);
  if (working.length === 0) return { label: "First time", reason: "No history yet — pick a load you can control for the bottom of the range.", weight: null, reps: repMin };
  const match = working[Math.min(setNumber - 1, working.length - 1)];
  const prevWeight = match.w ?? null, prevReps = match.r ?? null;
  const inc = (w) => (isCompound ? (w >= 100 ? 5 : 2.5) : (w >= 40 ? 5 : 2.5));
  if (repMax != null && prevWeight != null) {
    const allTopped = working.every((s) => (s.r ?? 0) >= repMax);
    if (allTopped) {
      const next = prevWeight + inc(prevWeight);
      return { label: "Add weight", reason: `You hit ${repMax} reps on every set last time. Move up to ${next} kg and restart near ${repMin} reps.`, weight: next, reps: repMin };
    }
  }
  const target = repMax != null && prevReps != null ? Math.min(prevReps + 1, repMax) : repMin;
  return { label: "Beat reps", reason: prevReps != null ? `Last time: ${prevReps} reps @ ${prevWeight ?? "—"} kg. Aim for ${target}.` : "Match the load and add a rep where you can.", weight: prevWeight, reps: target };
}

export function ironScore(row) { return Math.round(row.totalVolume / 1000 + row.setsCount * 2 + row.sessions * 25 + row.activeWeeks * 40); }
export const LEVELS = [{ name: "Rookie", min: 0 }, { name: "Grinder", min: 250 }, { name: "Contender", min: 600 }, { name: "Beast", min: 1200 }, { name: "Titan", min: 2200 }, { name: "Iron Legend", min: 3600 }];
export function levelFor(score) {
  let idx = 0; LEVELS.forEach((l, i) => { if (score >= l.min) idx = i; });
  const current = LEVELS[idx], next = LEVELS[idx + 1];
  const pct = next ? Math.round(((score - current.min) / (next.min - current.min)) * 100) : 100;
  return { current, next, pct };
}
export function navyBodyFat({ sex, height, neck, waist, hip }) {
  if (!height || !neck || !waist) return null;
  if (sex === "female" && !hip) return null;
  const value = sex === "male"
    ? 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450
    : 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)) - 450;
  if (!Number.isFinite(value) || value <= 0 || value > 75) return null;
  return Math.round(value * 10) / 10;
}
