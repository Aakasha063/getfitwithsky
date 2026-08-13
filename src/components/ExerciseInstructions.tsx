import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Exercise } from "@/lib/api";

function List({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExerciseInstructions({
  exercise,
  open,
  onOpenChange,
}: {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {exercise && (
          <>
            <SheetHeader>
              <SheetTitle className="text-left">{exercise.name}</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-10">
              <p className="text-sm text-muted-foreground">
                {exercise.primary_muscle} · {exercise.equipment} ·{" "}
                {exercise.is_compound ? "Compound" : "Isolation"}
              </p>
              <List title="Setup" items={exercise.setup} />
              <List title="Execution" items={exercise.execution} />
              <List title="Cues" items={exercise.cues} />
              <List title="Common mistakes" items={exercise.common_mistakes} />
              {exercise.should_feel && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    What it should feel like
                  </h4>
                  <p className="mt-2 text-sm">{exercise.should_feel}</p>
                </div>
              )}
              {exercise.breathing && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Breathing
                  </h4>
                  <p className="mt-2 text-sm">{exercise.breathing}</p>
                </div>
              )}
              {exercise.lower_back_notes && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-destructive">
                    Lower-back safety
                  </h4>
                  <p className="mt-1.5 text-sm">{exercise.lower_back_notes}</p>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}