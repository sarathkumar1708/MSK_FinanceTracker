import { useEffect, useId, useRef, useState } from "react";

function SelectDropdown({
  id,
  value,
  options = [],
  placeholder = "Select",
  disabled = false,
  visibleCount = 6,
  onChange
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

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

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const handleSelect = (nextValue) => {
    onChange?.(nextValue);
    setOpen(false);
  };

  return (
    <div
      className={`select-dropdown ${open ? "is-open" : ""} ${
        disabled ? "is-disabled" : ""
      }`}
      ref={rootRef}
    >
      <button
        id={selectId}
        type="button"
        className="select-dropdown-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={selected ? "" : "is-placeholder"}>
          {selected?.label || placeholder}
        </span>
        <span className="select-dropdown-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul
          className="select-dropdown-menu"
          role="listbox"
          style={{ "--visible-count": visibleCount }}
          aria-labelledby={selectId}
        >
          <li role="option" aria-selected={value === ""}>
            <button
              type="button"
              className={`select-dropdown-option ${
                value === "" ? "is-selected" : ""
              }`}
              onClick={() => handleSelect("")}
            >
              {placeholder}
            </button>
          </li>

          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
            >
              <button
                type="button"
                className={`select-dropdown-option ${
                  value === option.value ? "is-selected" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SelectDropdown;
