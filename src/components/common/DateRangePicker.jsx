import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLabel(fromDate, toDate) {
  if (!fromDate && !toDate) return "Select date range";

  const fromLabel = fromDate
    ? parseDateKey(fromDate)?.toLocaleDateString()
    : "Start";
  const toLabel = toDate ? parseDateKey(toDate)?.toLocaleDateString() : "End";

  return `${fromLabel} – ${toLabel}`;
}

function DateRangePicker({ fromDate = "", toDate = "", onChange }) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(fromDate);
  const [draftTo, setDraftTo] = useState(toDate);
  const [viewDate, setViewDate] = useState(() => {
    return parseDateKey(fromDate) || parseDateKey(toDate) || new Date();
  });

  useEffect(() => {
    if (!open) return;

    setDraftFrom(fromDate);
    setDraftTo(toDate);
    setViewDate(parseDateKey(fromDate) || parseDateKey(toDate) || new Date());
  }, [open, fromDate, toDate]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let i = 0; i < startOffset; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [viewDate]);

  const handleDayClick = (date) => {
    const key = toDateKey(date);

    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(key);
      setDraftTo("");
      return;
    }

    if (key < draftFrom) {
      setDraftTo(draftFrom);
      setDraftFrom(key);
      return;
    }

    setDraftTo(key);
  };

  const applyRange = () => {
    onChange?.({
      fromDate: draftFrom,
      toDate: draftTo || draftFrom
    });
    setOpen(false);
  };

  const clearRange = () => {
    setDraftFrom("");
    setDraftTo("");
    onChange?.({ fromDate: "", toDate: "" });
    setOpen(false);
  };

  const monthLabel = viewDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

  return (
    <div className="date-range-picker" ref={rootRef}>
      <button
        type="button"
        className={`date-range-trigger ${open ? "is-open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <CalendarRange size={16} />
        <span>{formatLabel(fromDate, toDate)}</span>
      </button>

      {open && (
        <div className="date-range-popover">
          <div className="date-range-popover-header">
            <button
              type="button"
              className="date-range-nav"
              aria-label="Previous month"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                )
              }
            >
              <ChevronLeft size={16} />
            </button>
            <strong>{monthLabel}</strong>
            <button
              type="button"
              className="date-range-nav"
              aria-label="Next month"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                )
              }
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="date-range-weekdays">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="date-range-grid">
            {days.map((date, index) => {
              if (!date) {
                return <span key={`empty-${index}`} className="date-range-empty" />;
              }

              const key = toDateKey(date);
              const isStart = key === draftFrom;
              const isEnd = key === (draftTo || draftFrom) && Boolean(draftFrom);
              const inRange =
                draftFrom &&
                draftTo &&
                key > draftFrom &&
                key < draftTo;
              const isToday = key === toDateKey(new Date());

              return (
                <button
                  key={key}
                  type="button"
                  className={[
                    "date-range-day",
                    isStart || isEnd ? "is-selected" : "",
                    inRange ? "is-in-range" : "",
                    isToday ? "is-today" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleDayClick(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-range-hint">
            {draftFrom && !draftTo
              ? "Select an end date"
              : "Select a start and end date"}
          </div>

          <div className="date-range-actions">
            <button type="button" className="filter-clear-button" onClick={clearRange}>
              Clear
            </button>
            <button
              type="button"
              className="btn btn-primary date-range-apply"
              disabled={!draftFrom}
              onClick={applyRange}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
