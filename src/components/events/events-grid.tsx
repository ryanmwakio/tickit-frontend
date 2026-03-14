import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { EventContent } from "@/data/events";
import { isEventPast, getEventStatus } from "@/lib/event-utils";

type EventsGridProps = {
  events: EventContent[];
};

export function EventsGrid({ events }: EventsGridProps) {
  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-8 min-h-[400px]">
      {/* Mobile Horizontal Scroll Container */}
      <div className="scrollbar-minimal no-scrollbar flex gap-4 overflow-x-auto scroll-smooth rounded-[32px] border border-slate-200 bg-white p-3 sm:p-4 lg:p-6 shadow-[0_15px_55px_rgba(15,23,42,0.08)] snap-x snap-mandatory mx-0 lg:hidden">
        {events.map((event) => {
          const isPast = isEventPast(event);
          const status = getEventStatus(event);
          return (
            <Link
              key={event.slug}
              href={`/events/${event.slug}`}
              className={`group relative w-72 shrink-0 snap-center flex flex-col rounded-[28px] border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-[0_12px_45px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.16)] overflow-hidden ${isPast ? "opacity-75" : ""}`}
            >
              <div className="relative h-48 overflow-hidden rounded-2xl">
                <Image
                  src={event.heroImage}
                  alt={event.title}
                  fill
                  sizes="288px"
                  className={`object-cover transition duration-500 ${isPast ? "grayscale" : "group-hover:scale-110"}`}
                />
                {isPast && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/30 to-transparent" />
                )}
                {isPast && (
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className} backdrop-blur-sm`}
                    >
                      <Clock className="size-3" />
                      {status.label}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 mt-4">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400 truncate">
                  {event.location}
                </div>
                <h2 className="text-base font-semibold text-slate-900 line-clamp-2 leading-tight">
                  {event.title}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500 truncate">
                    {event.dateCard || event.dateFull}
                  </p>
                  <span className="text-slate-300">•</span>
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {event.region}
                  </p>
                </div>
                <p className="flex-1 text-xs text-slate-600 line-clamp-2">
                  {event.summary}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {event.categories.slice(0, 1).map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
                    >
                      {category}
                    </span>
                  ))}
                  {event.tags.slice(0, 1).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <span
                    className={`text-sm font-bold truncate ${isPast ? "text-slate-500" : "text-slate-900"}`}
                  >
                    {event.price}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                      isPast
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {isPast ? "Event Ended" : "Tickets"}
                    {!isPast && <span aria-hidden>→</span>}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:contents">
        {events.map((event) => {
          const isPast = isEventPast(event);
          const status = getEventStatus(event);
          return (
            <Link
              key={event.slug}
              href={`/events/${event.slug}`}
              className={`flex flex-col rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-2xl overflow-hidden ${isPast ? "opacity-75" : ""}`}
            >
              <div className="relative">
                <Image
                  src={event.heroImage}
                  alt={event.title}
                  width={520}
                  height={360}
                  className={`h-48 w-full object-cover ${isPast ? "grayscale" : ""}`}
                />
                {isPast && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/30 to-transparent" />
                )}
                {isPast && (
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className} backdrop-blur-sm shadow-lg`}
                    >
                      <Clock className="size-3" />
                      {status.label}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400 truncate">
                  {event.location}
                </div>
                <h2 className="text-xl font-semibold text-slate-900 line-clamp-2 leading-tight">
                  {event.title}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-500 truncate">
                    {event.dateCard || event.dateFull}
                  </p>
                  <span className="text-slate-300">•</span>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {event.region}
                  </p>
                </div>
                <p className="flex-1 text-sm text-slate-600 line-clamp-2">
                  {event.summary}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {event.categories.slice(0, 2).map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                    >
                      {category}
                    </span>
                  ))}
                  {event.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <span
                    className={`text-sm font-bold truncate ${isPast ? "text-slate-500" : "text-slate-900"}`}
                  >
                    {event.price}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                      isPast
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {isPast ? "Event Ended" : "Get tickets"}
                    {!isPast && <span aria-hidden>→</span>}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
