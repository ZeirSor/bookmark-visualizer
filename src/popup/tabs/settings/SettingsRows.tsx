import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { CheckIcon, ChevronRightIcon } from "../../components/PopupIcons";

export interface SelectOption {
  label: string;
  value: string;
}

export function SettingsSection({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="settings-card settings-section">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      <div className="settings-section-body">{children}</div>
    </section>
  );
}

export function SettingRow({
  control,
  description,
  icon,
  label
}: {
  control: ReactNode;
  description?: string;
  icon?: ReactNode;
  label: string;
}) {
  return (
    <div className="setting-row">
      <div className="setting-copy">
        {icon ? <span className="setting-icon" aria-hidden="true">{icon}</span> : null}
        <span>
          <strong>{label}</strong>
          {description ? <small>{description}</small> : null}
        </span>
      </div>
      <div className="setting-control">{control}</div>
    </div>
  );
}

export function Keycap({
  children,
  muted = false
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return <kbd className={muted ? "is-muted" : ""}>{children}</kbd>;
}

export function Switch({
  checked,
  disabled = false,
  label,
  onChange
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange(value: boolean): void;
}) {
  return (
    <label className="switch-control">
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function SwitchRow({
  checked,
  description,
  label,
  onChange
}: {
  checked: boolean;
  description?: string;
  label: string;
  onChange(value: boolean): void;
}) {
  return (
    <SettingRow
      label={label}
      description={description}
      control={<Switch checked={checked} label={label} onChange={onChange} />}
    />
  );
}

export function SelectRow({
  description,
  label,
  onChange,
  options,
  value
}: {
  description?: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange(value: string): void;
}) {
  return (
    <SettingRow
      label={label}
      description={description}
      control={<CustomSelect label={label} value={value} options={options} onChange={onChange} />}
    />
  );
}

export function CustomSelect({
  disabled = false,
  label,
  onChange,
  options,
  value
}: {
  disabled?: boolean;
  label: string;
  options: SelectOption[];
  value: string;
  onChange(value: string): void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const selectedOption = useMemo(
    () => options[selectedIndex] ?? options[0],
    [options, selectedIndex]
  );

  useEffect(() => {
    if (open) {
      setActiveIndex(selectedIndex);
    }
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`custom-select ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}>
      <button
        type="button"
        className="custom-select-trigger"
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) =>
              getNextIndex(current, event.key === "ArrowDown" ? 1 : -1, options.length)
            );
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (open) {
              selectIndex(activeIndex);
            } else {
              setOpen(true);
            }
          }
        }}
      >
        <span>{selectedOption?.label ?? "请选择"}</span>
        <ChevronRightIcon />
      </button>
      {open ? (
        <div id={listboxId} className="custom-select-menu" role="listbox" aria-label={label}>
          {options.map((option, index) => {
            const selected = option.value === value;
            const active = index === activeIndex;

            return (
              <button
                key={option.value}
                type="button"
                className={`custom-select-option ${selected ? "is-selected" : ""} ${active ? "is-active" : ""}`}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => selectIndex(index)}
              >
                <span>{option.label}</span>
                {selected ? <CheckIcon /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  function selectIndex(index: number) {
    const option = options[index];
    if (!option) {
      return;
    }

    onChange(option.value);
    setOpen(false);
  }
}

function getNextIndex(current: number, offset: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return (current + offset + length) % length;
}
