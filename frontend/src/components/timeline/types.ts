import type { EventItem } from "../../lib/api";

export type TimelineViewMode = "decade" | "year" | "phase";
export type TimeFocus = "1" | "5" | "10" | "lifetime";

export type TimelineItem = {
  event: EventItem;
  lane: number;
  startYearFraction: number;
  endYearFraction: number;
  type: "milestone" | "duration";
};

export type TimelineMemoryMarker = {
  id: string;
  eventId: string;
  title: string;
  x: number;
};

export const CATEGORY_COLORS: Record<string, string> = {
  career: "#5d7fbe",
  personal: "#b86f7d",
  family: "#cb9359",
  finance: "#4c8b70",
  health: "#4a928f",
  travel: "#7a68b4",
  dreams: "#555bba",
};

export const CATEGORY_ORDER = ["career", "personal", "family", "finance", "health", "travel", "dreams"];
export const STATUS_ORDER = ["planned", "in-progress", "completed", "paused"];

export function labelCase(value: string): string {
  return value.replace(/-/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}
