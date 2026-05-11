/**
 * Notification routes.
 *
 * Endpoints exposed:
 *   GET /api/notifications           — list (with optional filters)
 *   GET /api/notifications/priority  — top-N priority inbox
 */

import { Router } from "express";
import {
  getNotifications,
  getPriorityNotifications,
} from "../controllers/notifications.controller";

const router = Router();

router.get("/", getNotifications);
router.get("/priority", getPriorityNotifications);

export default router;