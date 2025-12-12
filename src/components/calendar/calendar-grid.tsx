"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import type { EventContent } from "@/data/events";
import { AddToCalendarButton } from "./add-to-calendar-button";
import { fetchEvents, mapEventToEventContent } from "@/lib/events-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CalendarGridProps = {
  events?: EventContent[]; // Optional - will fetch if not provided
  initialMonth?: number; // zero-indexed
  initialYear?: number;
};

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Generate years from 2 years ago to 3 years in the future
function generateYears() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 2; i <= currentYear + 3; i++) {
    years.push(i);
  }
  return years;
}

function formatKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatModalDate(date: Date) {
  return date.toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CalendarGrid({
  events: propEvents,
  initialMonth = new Date().getMonth(),
  initialYear = new Date().getFullYear(),
}: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [monthEvents, setMonthEvents] = useState<EventContent[]>(propEvents || []);
  const [loading, setLoading] = useState(!propEvents);
  const prevMonthYearRef = useRef<{ month: number; year: number }>({ month: currentMonth, year: currentYear });

  // Update monthEvents when propEvents or month/year change
  useEffect(() => {
    const monthChanged = prevMonthYearRef.current.month !== currentMonth || prevMonthYearRef.current.year !== currentYear;
    prevMonthYearRef.current = { month: currentMonth, year: currentYear };

    if (propEvents && propEvents.length > 0) {
      // Filter propEvents to only include events in the current month
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      lastDay.setHours(23, 59, 59, 999);

      const monthEventsFiltered = propEvents.filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate >= firstDay && eventDate <= lastDay;
      });

      setMonthEvents(monthEventsFiltered);
      setLoading(false);
      return;
    }

    // Only fetch if no propEvents provided
    if (!propEvents || propEvents.length === 0) {
      let isCancelled = false;
      
      async function loadMonthEvents() {
        setLoading(true);
        try {
          const firstDay = new Date(currentYear, currentMonth, 1);
          const lastDay = new Date(currentYear, currentMonth + 1, 0);
          lastDay.setHours(23, 59, 59, 999);

          const response = await fetchEvents({
            page: 1,
            limit: 100,
            sortBy: "startsAt",
            sortOrder: "ASC",
            startsFrom: firstDay.toISOString(),
            startsTo: lastDay.toISOString(),
          });

          if (isCancelled) return;

          setMonthEvents(response.data.map(mapEventToEventContent));
        } catch (error) {
          if (isCancelled) return;
          console.error("Failed to load month events:", error);
          setMonthEvents([]);
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      }

      loadMonthEvents();

      return () => {
        isCancelled = true;
      };
    }
  }, [currentMonth, currentYear, propEvents]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventContent[]>();
    monthEvents.forEach((event) => {
      const date = new Date(event.startDate);
      const key = formatKey(date);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(event);
    });
    return map;
  }, [monthEvents]);

  const cells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7; // convert to Monday start
    const totalCells = 42;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - startOffset + 1;
      if (dayNumber < 1 || dayNumber > totalDays) {
        return { date: null as Date | null };
      }
      return { date: new Date(currentYear, currentMonth, dayNumber) };
    });
  }, [currentMonth, currentYear]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate.get(formatKey(selectedDate)) ?? [];
  }, [eventsByDate, selectedDate]);

  const calendarTitle = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).toLocaleString("en-KE", {
      month: "long",
      year: "numeric",
    });
  }, [currentMonth, currentYear]);

  const openModal = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  const goToPreviousMonth = () => {
    setSelectedDate(null);
    setModalOpen(false);
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((year) => year - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setSelectedDate(null);
    setModalOpen(false);
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((year) => year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleMonthChange = (monthIndex: string) => {
    setSelectedDate(null);
    setModalOpen(false);
    setCurrentMonth(parseInt(monthIndex, 10));
  };

  const handleYearChange = (year: string) => {
    setSelectedDate(null);
    setModalOpen(false);
    setCurrentYear(parseInt(year, 10));
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(null);
    setModalOpen(false);
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const availableYears = useMemo(() => generateYears(), []);
  const isCurrentMonth = useMemo(() => {
    const today = new Date();
    return currentMonth === today.getMonth() && currentYear === today.getFullYear();
  }, [currentMonth, currentYear]);

  return (
    <div className="overflow-hidden rounded-2xl sm:rounded-[32px] border border-slate-100 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex-1 w-full">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-400 mb-1">
            Calendar View
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
            <Select
              value={currentMonth.toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[120px] sm:w-[140px] h-8 sm:h-9 text-xs sm:text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={currentYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[80px] sm:w-[100px] h-8 sm:h-9 text-xs sm:text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-2 hidden sm:block">
            Tap a date to view events scheduled for that day
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg sm:rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors shadow-sm"
              aria-label="Go to today"
            >
              Today
            </button>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="rounded-lg sm:rounded-xl border border-slate-200 bg-white p-2 sm:p-2.5 hover:border-slate-400 hover:bg-slate-50 transition-colors shadow-sm"
              aria-label="Previous month"
              disabled={loading}
            >
              <span className="text-slate-600 text-base sm:text-lg">←</span>
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded-lg sm:rounded-xl border border-slate-200 bg-white p-2 sm:p-2.5 hover:border-slate-400 hover:bg-slate-50 transition-colors shadow-sm"
              aria-label="Next month"
              disabled={loading}
            >
              <span className="text-slate-600 text-base sm:text-lg">→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-100 text-center text-[10px] sm:text-xs lg:text-sm font-semibold text-slate-600">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-gradient-to-b from-slate-50 to-white py-2 sm:py-3 lg:py-4 border-b border-slate-100">
            {day}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-px bg-slate-100">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] bg-white animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-slate-100">
          {cells.map(({ date }, index) => {
            const dateKey = date ? formatKey(date) : "";
            const dayEvents = date ? eventsByDate.get(dateKey) ?? [] : [];
            const isEventDay = dayEvents.length > 0;
            const isToday = date && formatKey(date) === formatKey(new Date());
            
            return (
              <button
                type="button"
                key={`${dateKey}-${index}`}
                onClick={() => openModal(date)}
                className={`relative min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] xl:min-h-[140px] bg-white p-1.5 sm:p-2 lg:p-2.5 xl:p-3 text-left transition-all duration-200 ${
                  date ? "hover:bg-slate-50 hover:shadow-md hover:z-10 active:bg-slate-100" : "cursor-default hover:bg-white"
                } ${
                  isEventDay 
                    ? "bg-gradient-to-br from-indigo-50/60 via-slate-50/40 to-white border-l-[2px] sm:border-l-[3px] border-indigo-500 shadow-sm" 
                    : ""
                } ${
                  isToday 
                    ? "ring-1 sm:ring-2 ring-indigo-500 ring-offset-0 sm:ring-offset-1 bg-indigo-50/30" 
                    : ""
                } ${
                  date ? "" : "cursor-default opacity-30"
                }`}
                disabled={!date}
              >
                <div className="flex items-start justify-between mb-1 sm:mb-1.5">
                  <span className={`text-[10px] sm:text-xs lg:text-sm font-bold ${
                    isToday 
                      ? "text-indigo-600 bg-indigo-100 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs" 
                      : isEventDay 
                        ? "text-slate-900" 
                        : "text-slate-500"
                  }`}>
                    {date?.getDate() ?? ""}
                  </span>
                  {isEventDay && (
                    <span className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] lg:min-w-[22px] h-4 sm:h-5 lg:h-5.5 px-1 sm:px-1.5 rounded-full bg-indigo-600 text-[9px] sm:text-[10px] font-bold text-white shadow-sm">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                {isEventDay ? (
                  <div className="mt-1 sm:mt-1.5 lg:mt-2 space-y-1 sm:space-y-1.5">
                    {dayEvents.slice(0, 1).map((event) => (
                      <div
                        key={event.slug}
                        className="rounded-md sm:rounded-lg bg-white/90 border border-indigo-200/50 px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <p className="text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-slate-900 truncate leading-tight">
                          {event.title}
                        </p>
                      </div>
                    ))}
                    {dayEvents.length > 1 && (
                      <p className="text-[9px] sm:text-[10px] text-indigo-600 font-bold mt-0.5 sm:mt-1">
                        +{dayEvents.length - 1} more
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 sm:mt-1.5 lg:mt-2 h-6 sm:h-8 lg:h-10" /> // Spacer for consistent height
                )}
              </button>
            );
          })}
        </div>
      )}

      {isModalOpen && selectedDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-10">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-xl rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl shadow-slate-900/20 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-slate-400">
                  {calendarTitle}
                </p>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 mt-1">
                  {formatModalDate(selectedDate)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {selectedEvents.length > 0
                    ? "Events scheduled for this date"
                    : "No featured events on this day yet"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 p-1.5 sm:p-2 text-slate-500 transition hover:border-slate-400 hover:text-slate-900 shrink-0"
                aria-label="Close modal"
              >
                <span className="text-lg sm:text-xl">×</span>
              </button>
            </div>

            {selectedEvents.length > 0 ? (
              <ul className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 max-h-[calc(90vh-180px)] sm:max-h-[60vh] overflow-y-auto -mr-2 pr-2">
                {selectedEvents.map((event) => (
                  <li
                    key={event.slug}
                    className="rounded-xl sm:rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm shadow-slate-100"
                  >
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/events/${event.slug}`}
                          className="text-base sm:text-lg font-semibold text-slate-900 hover:underline break-words"
                        >
                          {event.title}
                        </Link>
                        <p className="text-xs sm:text-sm text-slate-500">{event.location}</p>
                        <p className="text-xs sm:text-sm font-medium text-slate-900">
                          {event.dateFull}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500">{event.price}</p>
                        <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          {event.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-200 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <AddToCalendarButton event={event} size="sm" />
                        <Link
                          href={`/events/${event.slug}`}
                          className="rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 transition hover:bg-slate-50 text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl border border-dashed border-slate-200 p-4 sm:p-6 text-xs sm:text-sm text-slate-500">
                Add your event for this day to unlock MPesa-ready checkout,
                shuttles, and ops guardrails.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

