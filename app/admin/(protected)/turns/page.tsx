import { getServices } from "@/lib/services-data";
import { getRotationBoard, getWaitingQueue, getDailyTurns } from "@/lib/actions/rotation";
import TurnBoard from "@/components/admin/TurnBoard";

export default async function TurnsPage() {
  const [services, rotation, queue, turns] = await Promise.all([
    getServices(),
    getRotationBoard(),
    getWaitingQueue(),
    getDailyTurns(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl text-foreground">Turn Rotation</h1>
      <p className="mt-1 text-sm text-muted">
        Walk-in queue and staff rotation, based on the turn-credit rules.
      </p>

      <TurnBoard
        services={services}
        initialRotation={rotation}
        initialQueue={queue}
        initialTurns={turns}
      />
    </div>
  );
}
