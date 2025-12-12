import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CalendarDays,
  ClipboardList,
  Compass,
  Map,
  ShieldCheck,
  Ticket,
  Users,
  Clock,
} from "lucide-react";
import { EventGallery } from "@/components/event-gallery";
import { MerchandiseSection } from "@/components/events/merchandise-section";
import { AutoOpenTicketButton } from "@/components/events/event-details-client";
import { EventMediaItem } from "@/data/events";
import { fetchEvent, mapEventToEventContent } from "@/lib/events-api";
import { EventContent } from "@/data/events";
import { isEventPast, getEventStatus } from "@/lib/event-utils";

type EventDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EventDetailProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  try {
    const eventDto = await fetchEvent(slug);
    const event = mapEventToEventContent(eventDto);
    return {
      title: `${event.title} | Tixhub`,
      description: event.summary,
    };
  } catch {
    return {
      title: "Event not found | Tixhub",
    };
  }
}

const infoBlocks = [
  {
    icon: CalendarDays,
    label: "When",
    getValue: (event: EventContent) => event.dateFull,
  },
  {
    icon: Compass,
    label: "Where",
    getValue: (event: EventContent) => event.location,
  },
  {
    icon: Ticket,
    label: "Pricing",
    getValue: (event: EventContent) => event.price,
  },
  {
    icon: ShieldCheck,
    label: "Compliance",
    getValue: (event: EventContent) => event.compliance[0] || "Organiser verified",
  },
];

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  
  let event: EventContent;
  try {
    const eventDto = await fetchEvent(slug);
    event = mapEventToEventContent(eventDto);
    
    // If the URL slug doesn't match the event's current slug, redirect to the new slug
    // This handles cases where the event title was changed and the slug was updated
    if (eventDto.slug && eventDto.slug !== slug) {
      const { redirect } = await import('next/navigation');
      redirect(`/events/${encodeURIComponent(eventDto.slug)}`);
    }
  } catch (error: any) {
    // Don't log 404 errors - they're expected when events don't exist
    // and will be handled by notFound()
    const status = error?.status || error?.response?.status || error?.statusCode;
    if (status !== 404) {
      // Log more details about the error
      console.error("Failed to fetch event:", {
        message: error?.message || error?.error?.message || "Unknown error",
        status: status,
        slug: slug,
        error: error
      });
    }
    notFound();
  }

  const galleryMedia: EventMediaItem[] = [
    { type: "image", src: event.heroImage },
    ...event.gallery,
  ];

  const isPast = isEventPast(event);
  const status = getEventStatus(event);

  return (
    <div className="bg-white text-slate-900">
      <section className="relative isolate overflow-hidden border-b border-slate-100 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-60" style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(79,70,229,0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.15), transparent 50%)",
          }} />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-6 sm:space-y-8 lg:space-y-10">
          <Link
            href="/events"
            className="text-xs sm:text-sm text-slate-500 transition hover:text-slate-900 inline-block"
          >
            ← Back to events
          </Link>

          <div className="grid items-start gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-4 sm:space-y-6 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {isPast && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className} backdrop-blur-sm shadow-lg`}>
                    <Clock className="size-3" />
                    {status.label}
                  </span>
                )}
                <span className="rounded-full border border-slate-200 px-2 sm:px-3 py-1 text-[10px] sm:text-xs uppercase tracking-[0.4em] text-slate-500">
                  {event.region}
                </span>
                <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-slate-500">
                  {event.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-slate-200/70 bg-white/60 px-2 sm:px-3 py-1"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">
                  {event.title}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-600 leading-relaxed">{event.summary}</p>
              </div>

              <div className={`rounded-2xl sm:rounded-3xl border border-slate-100 bg-white/90 p-4 sm:p-5 shadow-lg shadow-slate-200/70 ${isPast ? 'opacity-75' : ''}`}>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-slate-400">
                  {isPast ? 'Event has ended' : 'Tickets from'}
                </p>
                <p className={`mt-2 text-2xl sm:text-3xl font-semibold ${isPast ? 'text-slate-500' : 'text-slate-900'}`}>
                  {event.price}
                </p>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isPast 
                    ? 'This event has concluded. Thank you for your interest.' 
                    : 'Instant MPesa rails, waitlists, and concierge settlement baked in.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                  {isPast ? (
                    <button
                      disabled
                      className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-slate-300 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-500 shadow-sm cursor-not-allowed"
                    >
                      Event Ended
                    </button>
                  ) : (
                    <Suspense fallback={
                      <button className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-slate-900 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:-translate-y-0.5">
                        Get tickets
                      </button>
                    }>
                      <AutoOpenTicketButton event={event} isPast={false} />
                    </Suspense>
                  )}
                  {!isPast && (
                    <Link
                      href="/tickets"
                      className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                    >
                      Talk to concierge
                    </Link>
                  )}
                </div>
              </div>

              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-slate-600">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 px-2 sm:px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {infoBlocks.map(({ icon: Icon, label, getValue }) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-lg shadow-slate-200/70"
                  >
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-slate-400">
                      <Icon className="size-4 text-indigo-500" />
                      <span>{label}</span>
                    </div>
                    <p className="mt-3 text-base font-semibold text-slate-900">
                      {getValue(event)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-w-0">
              <div className={`overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-slate-100 bg-slate-900 shadow-[0_40px_120px_rgba(15,23,42,0.25)] ${isPast ? 'opacity-75' : ''}`}>
                <Image
                  src={event.heroImage}
                  alt={event.title}
                  width={960}
                  height={640}
                  className={`h-[280px] sm:h-[350px] lg:h-[420px] w-full object-cover ${isPast ? 'grayscale' : ''}`}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                {isPast && (
                  <div className="absolute top-6 right-6 z-20">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold ${status.className} backdrop-blur-md shadow-xl`}>
                      <Clock className="size-4" />
                      {status.label}
                    </span>
                  </div>
                )}
                <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                      Signature venue
                    </p>
                    <p className="mt-2 text-2xl font-semibold leading-snug">
                      {event.location}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/40 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                        When
                      </p>
                      <p className="mt-2 text-lg font-semibold">{event.dateFull}</p>
                    </div>
                    <div className="rounded-2xl border border-white/40 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                        Starting at
                      </p>
                      <p className="mt-2 text-lg font-semibold">{event.price}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/70 sm:-mt-10 lg:translate-x-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Concierge ready
                  </p>
                  <p className="text-sm text-slate-600">
                    Instant MPesa rails + curated hospitality upgrades.
                  </p>
                </div>
                <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white w-full sm:w-auto">
                  Talk to us
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white/90 p-4 sm:p-6 shadow-lg shadow-slate-200/70 lg:flex lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Live pulse
              </p>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                VIP decks, transport clusters, and sponsor lounges updating in real time.
              </p>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 lg:mt-0">
              <button className="rounded-xl sm:rounded-2xl bg-slate-900 px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white w-full sm:w-auto">
                Reserve seats
              </button>
              <button className="rounded-xl sm:rounded-2xl border border-slate-200 px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 w-full sm:w-auto">
                Download brief
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-[1.5fr,1fr]">
            <div className="space-y-6 sm:space-y-8 min-w-0">
              {galleryMedia.length > 0 && (
                <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70 overflow-hidden">
                  <div className="mb-3 sm:mb-4">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400">
                      Immersive gallery
                    </p>
                    <p className="mt-1 text-xs sm:text-sm lg:text-base font-semibold text-slate-900 break-words">
                      Tap any frame for the lightbox experience
                    </p>
                  </div>
                  <div className="overflow-hidden">
                    <EventGallery media={galleryMedia} title={event.title} />
                  </div>
                </article>
              )}

              {event.summary && (
                <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold break-words">About the experience</h2>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed break-words">
                    {event.summary}
                  </p>
                  {event.tags.length > 0 && (
                    <div className="mt-4 sm:mt-5 flex flex-wrap gap-1.5 sm:gap-2">
                      {event.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-slate-200 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-slate-600 whitespace-nowrap">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              )}

              {event.highlights.length > 0 && (
                <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold break-words">Highlights</h2>
                  <div className="mt-3 sm:mt-4 lg:mt-5 grid gap-2.5 sm:gap-3 lg:gap-4 md:grid-cols-2">
                    {event.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4 text-xs sm:text-sm text-slate-600 break-words"
                      >
                        {highlight}
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {event.schedule.length > 0 && (
                <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold break-words">Program flow</h2>
                  <div className="mt-3 sm:mt-4 lg:mt-6 space-y-3 sm:space-y-4 lg:space-y-6">
                    {event.schedule.map((item, index) => (
                      <div key={`${item.time}-${item.title}`} className="flex gap-2 sm:gap-3 lg:gap-4">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="rounded-full border border-slate-300 bg-white px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-slate-900 whitespace-nowrap">
                            {item.time}
                          </div>
                          {index < event.schedule.length - 1 && (
                            <span className="mt-1.5 sm:mt-2 h-full min-h-[20px] w-px bg-slate-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 break-words">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs sm:text-sm text-slate-600 break-words leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {event.ticketTiers.length > 0 && (
                <article
                  id="ticketing"
                  className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70"
                >
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold break-words">Ticket architecture</h2>
                  <div className="mt-3 sm:mt-4 lg:mt-5 grid gap-2.5 sm:gap-3 lg:gap-4 md:grid-cols-2">
                    {event.ticketTiers.map((tier, index) => (
                      <div
                        key={tier.id || `tier-${index}`}
                        className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm sm:text-base font-semibold text-slate-900 break-words flex-1 min-w-0">
                            {tier.name}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 whitespace-nowrap shrink-0">{tier.price}</p>
                        </div>
                        {tier.benefits.length > 0 && (
                          <ul className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 text-[11px] sm:text-xs text-slate-600">
                            {tier.benefits.map((benefit, benefitIndex) => (
                              <li key={`${tier.id || `tier-${index}`}-benefit-${benefitIndex}`} className="break-words">• {benefit}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {event.seatMap && (event.seatMap.layout || (event.seatMap.sections && event.seatMap.sections.length > 0)) && (
                <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70 overflow-hidden">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-5">
                    <Map className="size-4 sm:size-5 text-indigo-500 shrink-0" />
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold break-words">Seat map & hospitality grid</h2>
                  </div>
                  {event.seatMap.layout && (
                    <div className="mt-3 sm:mt-4 lg:mt-5 rounded-xl sm:rounded-2xl overflow-hidden">
                      <Image
                        src={event.seatMap.layout}
                        alt="Seat map"
                        width={960}
                        height={540}
                        className="h-48 sm:h-56 lg:h-64 w-full object-cover"
                      />
                    </div>
                  )}
                  {event.seatMap.sections && event.seatMap.sections.length > 0 && (
                    <div className="mt-4 sm:mt-5 lg:mt-6 grid gap-3 sm:gap-4 md:grid-cols-2">
                      {event.seatMap.sections.map((section) => (
                        <div
                          key={section.name}
                          className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4"
                        >
                          <div className="flex items-start justify-between gap-2 text-xs sm:text-sm">
                            <p className="font-semibold text-slate-900 break-words flex-1 min-w-0">{section.name}</p>
                            <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap shrink-0">
                              {section.availability}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400 break-words">
                            {section.price}
                          </p>
                          {section.perks && section.perks.length > 0 && (
                            <ul className="mt-2 sm:mt-3 space-y-1 text-[11px] sm:text-xs text-slate-600">
                              {section.perks.map((perk) => (
                                <li key={perk} className="break-words">• {perk}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              )}

              {(event.experiences.length > 0 || event.addOns.length > 0) && (
                <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold break-words">Experiences & add-ons</h2>
                  {event.experiences.length > 0 && (
                    <div className="mt-3 sm:mt-4 lg:mt-5 grid gap-2.5 sm:gap-3 lg:gap-4 md:grid-cols-2">
                      {event.experiences.map((experience) => (
                        <div
                          key={experience}
                          className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4 text-xs sm:text-sm text-slate-600 break-words"
                        >
                          {experience}
                        </div>
                      ))}
                    </div>
                  )}
                  {event.addOns.length > 0 && (
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                      {event.addOns.map((addOn) => (
                        <span key={addOn} className="rounded-full border border-slate-200 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-slate-600 whitespace-nowrap">
                          {addOn}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              )}

              {/* Merchandise Section */}
              {(event as any).merchandise && (event as any).merchandise.length > 0 && (
                <MerchandiseSection items={(event as any).merchandise} />
              )}

              {event.faqs.length > 0 && (
                <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold break-words">FAQs & playbook</h2>
                  <div className="mt-3 sm:mt-4 lg:mt-5 space-y-2 sm:space-y-3">
                    {event.faqs.map((faq) => (
                      <details
                        key={faq.question}
                        className="group rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4"
                      >
                        <summary className="flex cursor-pointer items-start justify-between gap-2 text-xs sm:text-sm font-semibold text-slate-900 break-words">
                          <span className="flex-1 min-w-0">{faq.question}</span>
                          <span className="text-slate-400 shrink-0 ml-2">
                            {"" /* caret handled by default */}
                          </span>
                        </summary>
                        <p className="mt-2 text-xs sm:text-sm text-slate-600 break-words leading-relaxed">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </article>
              )}
            </div>

            <aside className="space-y-5 sm:space-y-6 lg:space-y-8 min-w-0">
              <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400">
                  Secure your spot
                </p>
                <p className="mt-2 sm:mt-3 lg:mt-4 text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-900 break-words">
                  {event.price}
                </p>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 break-words">
                  Includes MPesa, card rails, and concierge settlement.
                </p>
                <div className="mt-4 sm:mt-5 lg:mt-6 space-y-2 sm:space-y-3">
                  <Suspense fallback={
                    <button className="w-full rounded-xl sm:rounded-2xl bg-slate-900 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white">
                      Get tickets
                    </button>
                  }>
                    <AutoOpenTicketButton event={event} isPast={isPast} fullWidth={true} showViewTickets={false} />
                  </Suspense>
                  <button className="w-full rounded-xl sm:rounded-2xl border border-slate-200 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900">
                    Join waitlist
                  </button>
                </div>
                <div className="mt-4 sm:mt-5 lg:mt-6 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4 text-xs sm:text-sm text-slate-600">
                  <p className="font-semibold text-slate-900 break-words">Group & hospitality</p>
                  <p className="mt-1 break-words leading-relaxed">
                    Private lounges, artist meetups, secure transport, and multi-day itineraries.
                  </p>
                </div>
              </article>

              {event.insights && (
                <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400">
                    Event telemetry
                  </p>
                  <div className="mt-3 sm:mt-4 grid gap-2.5 sm:gap-3 lg:gap-4">
                    {event.insights.map((insight) => (
                      <div
                        key={insight.label}
                        className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4"
                      >
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400 break-words">
                          {insight.label}
                        </p>
                        <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 break-words">
                          {insight.value}
                        </p>
                        {insight.change && (
                          <p className="mt-1 text-[10px] sm:text-xs text-emerald-500 break-words">{insight.change}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {event.partners && (
                <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <ClipboardList className="size-4 sm:size-5 text-indigo-500 shrink-0" />
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold break-words">Partners & services</h3>
                  </div>
                  <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                    {event.partners.map((partner) => (
                      <div
                        key={partner.title}
                        className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4"
                      >
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 break-words">
                          {partner.title}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-slate-600 break-words leading-relaxed">
                          {partner.description}
                        </p>
                        <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                          {partner.actions.map((action) => (
                            <Link
                              key={action.label}
                              href={action.href}
                              className="rounded-full border border-slate-200 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-slate-600 transition hover:border-slate-400 whitespace-nowrap"
                            >
                              {action.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {event.compliance.length > 0 && (
                <article className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6 shadow-lg shadow-slate-200/70">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Users className="size-4 sm:size-5 text-slate-500 shrink-0" />
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold break-words">Community & compliance</h3>
                  </div>
                  <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-600">
                    {event.compliance.map((item) => (
                      <li key={item} className="flex items-start gap-2 break-words">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                        <span className="flex-1 min-w-0 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )}
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
