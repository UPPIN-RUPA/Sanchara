import { useEffect, useMemo, useState } from "react";
import {
  getEvents,
  getFinancialSummary,
  type EventItem,
  type FinancialSummary,
} from "../lib/api";

export function useSavingsData() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setIsLoading(true);
    setError("");
    try {
      const [eventResponse, financialResponse] = await Promise.all([
        getEvents({ pageSize: 100 }),
        getFinancialSummary(),
      ]);
      setEvents(eventResponse.items);
      setFinancial(financialResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load savings.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const financialEvents = useMemo(
    () => events.filter((event) => event.is_financial),
    [events]
  );

  const totals = useMemo(() => {
    const totalTarget = financial?.total_savings_target ?? 0;
    const totalSaved = financial?.total_amount_saved ?? 0;

    return {
      totalTarget,
      totalSaved,
      remainingAmount: Math.max(totalTarget - totalSaved, 0),
      fundedPlans: financial?.fully_funded_events ?? 0,
      upcomingFinancialPlans: financial?.upcoming_financial_events ?? 0,
    };
  }, [financial]);

  return {
    events: financialEvents,
    financial,
    totals,
    isLoading,
    error,
    refresh,
  };
}
