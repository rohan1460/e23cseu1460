/**
 * Priority Inbox service.
 *
 * For each notification we compute a weighted score combining:
 *   - Type weight (Placement > Result > Event)
 *   - Recency (newer notifications score higher)
 *
 * The score function is intentionally simple and explainable:
 *     score = typeWeight * 1_000_000 + recencyComponent
 *
 * Where recencyComponent is the Unix timestamp in seconds. Because the
 * type weight is multiplied by a value larger than any plausible
 * timestamp delta within the active feed window, type strictly dominates
 * recency in the ranking, with recency acting as a tiebreaker. This
 * matches the brief: "weight (placement > result > event) and recency".
 *
 * We use a bounded TopNHeap so the algorithm is O(m log n) in m
 * notifications — fast even as the feed grows large.
 */

import { Log } from "logging-middleware";
import { RemoteNotification } from "../repository/testServer.repo";
import { TopNHeap } from "../utils/heap";

const TYPE_WEIGHT: Record<RemoteNotification["Type"], number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// Multiplier large enough that any type weight strictly outranks any
// recency component within the feed's effective time horizon.
const TYPE_RANK_MULTIPLIER = 10_000_000_000;

export function computeScore(n: RemoteNotification): number {
  const typeWeight = TYPE_WEIGHT[n.Type] ?? 0;
  const ts = Date.parse(n.Timestamp.replace(" ", "T") + "Z");
  const recency = Number.isFinite(ts) ? Math.floor(ts / 1000) : 0;
  return typeWeight * TYPE_RANK_MULTIPLIER + recency;
}

export async function pickTopN(
  notifications: RemoteNotification[],
  n: number
): Promise<RemoteNotification[]> {
  await Log(
    "backend",
    "debug",
    "service",
    `computing top-${n} priority over ${notifications.length} notifications`
  );

  const heap = new TopNHeap<RemoteNotification>(n, computeScore);
  for (const note of notifications) {
    heap.add(note);
  }

  const result = heap.toSortedArray();

  await Log(
    "backend",
    "info",
    "service",
    `top-${n} priority computed, returning ${result.length} items`
  );

  return result;
}