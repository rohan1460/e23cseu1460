/**
 * HTTP controller for notification endpoints. Translates Express
 * request/response objects into service-layer calls and back.
 */

import { Request, Response, NextFunction } from "express";
import { Log } from "logging-middleware";
import {
  listNotifications,
  listPriorityNotifications,
} from "../services/notifications.service";

const ALLOWED_TYPES = ["Event", "Result", "Placement"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseOptionalNumber(req.query.limit);
    const page = parseOptionalNumber(req.query.page);
    const notificationType = parseType(req.query.notification_type);

    await Log(
      "backend",
      "info",
      "controller",
      `GET /api/notifications limit=${limit} page=${page} type=${notificationType}`
    );

    const data = await listNotifications({
      limit,
      page,
      notificationType,
    });

    res.status(200).json({ notifications: data });
  } catch (err) {
    next(err);
  }
}

export async function getPriorityNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const n = parseOptionalNumber(req.query.n) ?? 10;
    if (n <= 0 || n > 100) {
      res.status(400).json({ error: "Query parameter 'n' must be 1..100" });
      return;
    }

    await Log(
      "backend",
      "info",
      "controller",
      `GET /api/notifications/priority n=${n}`
    );

    const data = await listPriorityNotifications(n);
    res.status(200).json({ notifications: data, count: data.length });
  } catch (err) {
    next(err);
  }
}

function parseOptionalNumber(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function parseType(raw: unknown): AllowedType | undefined {
  if (typeof raw !== "string") return undefined;
  return (ALLOWED_TYPES as readonly string[]).includes(raw)
    ? (raw as AllowedType)
    : undefined;
}