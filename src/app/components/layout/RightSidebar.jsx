import React from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "../ui/label.jsx";
import { Switch } from "../ui/switch.jsx";
import { Slider } from "../ui/slider.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.jsx";
import { Input } from "../ui/input.jsx";
import { ColorControl } from "../ui/colorControl.jsx";
import { Info, Bug, Sparkles, ChevronDown } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

/** Convert "wb-split-type" → "Split Type" */
const formatAttributeName = (attrName) => {
  return attrName
    .replace(/^wb-/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getInputType = (attr) => attr.inputType || "text";
const getDropdownOptions = (attr) => attr.options || [attr.default];
const getSliderConfig = (attr) =>
  attr.sliderConfig || { min: 0, max: 100, step: 1 };

/** Parse installationNotes: style HTML tag references as inline code */
const renderInstallationNotes = (text) => {
  const parts = text.split(/(<[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?>)/g);
  return parts.map((part, index) => {
    if (/^<[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?>$/.test(part)) {
      return (
        <code
          key={index}
          className="px-1 py-px rounded bg-black/[0.05] text-black font-mono text-[12px]"
        >
          {part}
        </code>
      );
    }
    return part;
  });
};

// Light, borderless field used by every text-like control in the editor.
const FIELD =
  "h-9 w-full rounded-lg border-0 bg-black/[0.04] px-3 text-[14px] text-black shadow-none hover:bg-black/[0.06] focus:ring-1 focus:ring-black/20 focus:ring-offset-0 disabled:opacity-50";

/* ═══════════════════════════════════════════════════════
   ConfigSidebar Component
   ═══════════════════════════════════════════════════════ */

const ConfigSidebar = ({
  component,
  activeAttributes,
  attributeValues,
  onToggleAttribute,
  onChangeValue,
}) => {
  if (!component) return null;

  const componentName = component.name.toLowerCase().replace(/ /g, "-");
  const navigate = useNavigate();

  const handleBugReport = () => {
    navigate(`?feedback=report&component=${componentName}`);
  };

  const handleFeatureRequest = () => {
    navigate(`?feedback=feature&component=${componentName}`);
  };

  /* ─── Render individual input control ─── */
  const renderInputControl = (attr) => {
    const inputType = getInputType(attr);
    const currentValue = attributeValues[attr.name] || attr.default;
    const isRequired = attr.required || attr.name === "wb-component";
    const isActive = activeAttributes[attr.name] || false;

    const handleValueChange = (newValue) => {
      onChangeValue(attr.name, newValue);
    };

    switch (inputType) {
      case "toggle": {
        const on = currentValue === "true" || currentValue === true;
        return (
          <div className="inline-flex p-0.5 rounded-lg bg-black/[0.04]">
            {[true, false].map((value) => (
              <button
                key={String(value)}
                type="button"
                disabled={isRequired || !isActive}
                onClick={() => handleValueChange(String(value))}
                className={`h-8 px-4 rounded-md text-[14px] transition-colors ${
                  on === value
                    ? "bg-white text-black shadow-sm font-medium"
                    : "text-black/50 hover:text-black"
                }`}
              >
                {value ? "True" : "False"}
              </button>
            ))}
          </div>
        );
      }

      case "color":
        return (
          <ColorControl
            value={currentValue.replace(/['"]/g, "")}
            onChange={handleValueChange}
            disabled={isRequired || !isActive}
            supportsAlpha={attr.supportsAlpha || false}
            multiple={attr.multiple || false}
          />
        );

      case "slider": {
        const sliderConfig = getSliderConfig(attr);
        const sliderValue = [parseFloat(currentValue) || 0];
        const sliderUnit = attr.unit || "";

        return (
          <div className="flex items-center gap-3">
            <Slider
              value={sliderValue}
              onValueChange={(value) => handleValueChange(value[0].toString())}
              min={sliderConfig.min}
              max={sliderConfig.max}
              step={sliderConfig.step}
              disabled={isRequired || !isActive}
              className="flex-1"
            />
            <span className="min-w-[56px] h-7 px-2 rounded-md bg-black/[0.04] flex items-center justify-center text-[13px] tabular-nums text-black">
              {currentValue}
              {sliderUnit}
            </span>
          </div>
        );
      }

      case "dropdown": {
        const options = getDropdownOptions(attr);
        return (
          <Select
            value={currentValue}
            onValueChange={handleValueChange}
            disabled={isRequired || !isActive}
          >
            <SelectTrigger className={FIELD}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case "text":
      default:
        return (
          <Input
            type="text"
            value={currentValue}
            disabled={isRequired || !isActive}
            onChange={(e) => handleValueChange(e.target.value)}
            className={FIELD}
          />
        );
    }
  };

  const attributes = component.attributes;

  return (
    <aside className="w-full lg:max-w-[320px] lg:min-w-[320px] bg-white rounded-lg lg:overflow-y-auto overflow-x-clip [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:rgba(0,0,0,0.15)_transparent]">
      <div className="flex flex-col p-5 gap-6">
        {/* ── Installation notes: always visible on desktop, collapsible on small screens ── */}
        {component.installationNotes && (
          <details className="group/notes" open>
            <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center justify-between cursor-pointer md:cursor-default md:pointer-events-none">
              <h2 className="font-inter-tight text-[17px] font-medium leading-6 text-black">
                Installation notes
              </h2>
              <ChevronDown className="w-4 h-4 text-black/40 transition-transform group-open/notes:rotate-180 md:hidden" />
            </summary>
            <p className="mt-2 text-[14px] leading-[22px] text-black/60">
              {renderInstallationNotes(component.installationNotes)}
            </p>
          </details>
        )}

        {/* ── Attribute editor ── */}
        <section>
          <h2 className="font-inter-tight text-[17px] font-medium leading-6 text-black mb-2">
            Attributes
          </h2>

          <ul className="divide-y divide-black/[0.06]">
            {attributes.map((attr) => {
              const isRequired = attr.required || attr.name === "wb-component";
              const isActive = activeAttributes[attr.name] || false;

              return (
                <li key={attr.name} className="relative py-3">
                  {/* Name + info on the left, on/off switch on the right */}
                  <div className="flex items-center gap-1.5 min-h-6">
                    <Label
                      htmlFor={`attr-${attr.name}`}
                      className={`text-[14px] font-medium transition-colors ${
                        isRequired || isActive ? "text-black" : "text-black/50"
                      }`}
                    >
                      {formatAttributeName(attr.name)}
                    </Label>
                    {attr.description && !isRequired && (
                      <span className="group/info flex">
                        <Info className="w-3.5 h-3.5 text-black/30 hover:text-black/60 cursor-help transition-colors" />
                        <span className="absolute z-20 top-10 inset-x-0 px-3 py-2 rounded-lg bg-black text-white text-[12px] leading-[17px] opacity-0 translate-y-1 group-hover/info:opacity-100 group-hover/info:translate-y-0 transition-[opacity,transform] duration-150 pointer-events-none">
                          {attr.description}
                        </span>
                      </span>
                    )}
                    <span className="ml-auto flex items-center">
                      {isRequired ? (
                        <span className="text-[12px] text-black/40">Required</span>
                      ) : (
                        <Switch
                          id={`attr-${attr.name}`}
                          checked={isActive}
                          onCheckedChange={(checked) =>
                            onToggleAttribute(attr.name, checked)
                          }
                          aria-label={`Use ${formatAttributeName(attr.name)}`}
                        />
                      )}
                    </span>
                  </div>

                  {/* Value control, shown once the attribute is in use */}
                  {(isRequired || isActive) && (
                    <div className="mt-2.5">{renderInputControl(attr)}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Feedback ── */}
        <section className="rounded-lg bg-black/[0.03] p-4">
          <h2 className="text-[14px] font-medium text-black">
            Found an issue or have an idea?
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-black/50">
            Help us improve {component.name}.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              { label: "Report bug", Icon: Bug, onClick: handleBugReport },
              { label: "Request feature", Icon: Sparkles, onClick: handleFeatureRequest },
            ].map(({ label, Icon, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="flex items-center gap-1.5 h-8 px-3 rounded-[26px] bg-white text-[13px] text-black/60 hover:text-black shadow-[0_0_0_1px_rgba(0,0,0,0.06)] transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};

export default ConfigSidebar;
