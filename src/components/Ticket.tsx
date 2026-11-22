import { event } from "@/data/event";
import { formatDateLabel, formatTimeLabel } from "@/lib/calendar";
import { PinIcon } from "@/components/ui";

/** The "ADMIT ONE" ticket stub with date, time and venue. */
export function Ticket({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex border-[3px] border-paper">
        <div className="flex flex-1 flex-col gap-2 border-r-[3px] border-dashed border-paper p-4">
          <span className="font-anton text-sm tracking-[0.18em] text-smoke">DATE · DOORS</span>
          <span className="font-anton text-[30px] leading-none">{formatDateLabel()}</span>
          <span className="font-anton text-[22px] leading-none">{formatTimeLabel()}</span>
          <span className="mt-2 font-anton text-sm tracking-[0.18em] text-smoke">VENUE</span>
          <span className="text-[17px] font-extrabold">{event.venue.name}</span>
          {!compact && <span className="text-sm text-smoke">{event.venue.address}</span>}
        </div>
        <div className="flex w-14 items-center justify-center">
          <span className="rotate-90 font-anton text-xl tracking-[0.2em] whitespace-nowrap">ADMIT ONE</span>
        </div>
      </div>
      <a
        href={event.venue.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center justify-center gap-2 bg-paper font-anton text-lg tracking-[0.12em] text-ink"
      >
        <PinIcon />
        HOW TO GET THERE
      </a>
    </div>
  );
}
