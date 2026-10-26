import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useInstallModal } from "../components/redesign/InstallModal.jsx";
import { getComponent } from "../../library/data/componentsMetadata.js";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import { cardThemes } from "../components/redesign/cardThemes.js";
import ConfigSidebar from "../components/layout/RightSidebar.jsx";
import SEO from "../components/SEO.jsx";
import { Copy, RotateCcw, Download, Code, RotateCw } from "lucide-react";
import { useWebflowBits } from "../hooks/useWebflowBits";
import { seoPages, jsonLd } from "../content/brandCopy.js";

const ComponentDetail = () => {
  const { componentName } = useParams();
  const installModal = useInstallModal();
  const [reloadKey, setReloadKey] = useState(0);
  const [copyStates, setCopyStates] = useState({});
  const [activeAttributes, setActiveAttributes] = useState({});
  const [attributeValues, setAttributeValues] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const { reinitializeComponents } = useWebflowBits();

  // Get component metadata
  const component = getComponent(componentName);
  // Effects with gallery art direction preview the same markup and surface as their card.
  const theme = cardThemes[componentName];
  const baseCode = theme?.code || component?.example.code || "";

  // Initialize active attributes and values based on example code
  useEffect(() => {
    if (!component) return;

    const initialAttributes = {};
    const initialValues = {};

    component.attributes.forEach((attr) => {
      if (attr.name === "wb-component") {
        initialAttributes[attr.name] = true;
        initialValues[attr.name] = attr.default;
      } else {
        const isInExample = baseCode.includes(attr.name);
        initialAttributes[attr.name] = isInExample;

        // Extract value from example code if present, otherwise use default
        if (isInExample) {
          const valueMatch = baseCode.match(
            new RegExp(`${attr.name}="([^"]*)"`),
          );
          initialValues[attr.name] = valueMatch ? valueMatch[1] : attr.default;
        } else {
          initialValues[attr.name] = attr.default;
        }
      }
    });

    setActiveAttributes(initialAttributes);
    setAttributeValues(initialValues);
    setInitialValues(initialValues);
  }, [component, baseCode]);

  // Refresh components when active attributes or values change
  useEffect(() => {
    if (Object.keys(activeAttributes).length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        reinitializeComponents();
      }, 100);
    }
  }, [activeAttributes, attributeValues, reinitializeComponents]);

  // Scroll to top when component changes
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    });
  }, [componentName]);

  /* ═══════════════════════════════════════════════════════
     Code Generation & Preview Helpers
     ═══════════════════════════════════════════════════════ */

  const reloadPreview = () => {
    setReloadKey((prev) => prev + 1);
    setTimeout(() => {
      reinitializeComponents();
    }, 100);
  };

  // Generate updated HTML code based on active attributes and values.
  // Every tag running this effect is rewritten (themed previews can hold several, e.g. the
  // decrypted-text wall). Each tag keeps its own authored values until the user changes that
  // attribute in the editor, so per-tag art direction survives the initial render.
  const generateUpdatedCode = () => {
    const componentTags = new RegExp(
      `<\\w+[^>]*wb-component="${componentName}"[^>]*>`,
      "g",
    );

    if (componentTags.test(baseCode)) {
      const name = attributeValues["wb-component"] || componentName;
      return baseCode.replace(componentTags, (tag) => {
        let updated = tag;
        component.attributes.forEach((attr) => {
          if (attr.name === "wb-component") return;
          const existing = new RegExp(`\\s${attr.name}="[^"]*"`);
          const hasAttr = existing.test(updated);

          if (!activeAttributes[attr.name]) {
            updated = updated.replace(existing, "");
            return;
          }

          const value = attributeValues[attr.name] || attr.default || "true";
          if (hasAttr && value === initialValues[attr.name]) return;

          const pair = ` ${attr.name}="${value}"`;
          updated = hasAttr
            ? updated.replace(existing, pair)
            : updated.replace(/\s*>$/, `${pair}>`);
        });
        return updated.replace(
          `wb-component="${componentName}"`,
          `wb-component="${name}"`,
        );
      });
    }

    // Fallback: use the old method for components without wb-component in example
    const tagMatch = baseCode.match(/<(\w+)([^>]*)>(.*?)<\/\1>/);
    if (!tagMatch) return baseCode;

    const [, tagName, , content] = tagMatch;
    const activeAttrList = [];

    component.attributes.forEach((attr) => {
      if (activeAttributes[attr.name]) {
        const value = attributeValues[attr.name] || attr.default || "true";
        activeAttrList.push(`${attr.name}="${value}"`);
      }
    });

    const attributesString =
      activeAttrList.length > 0 ? " " + activeAttrList.join(" ") : "";
    return `<${tagName}${attributesString}>${content}</${tagName}>`;
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopyStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Extract wb- attributes from HTML code
  const extractWbAttributes = (htmlCode) => {
    const wbAttributes = [];
    const seenAttributes = new Set();
    const wbRegex = /wb-[\w-]+(?:="[^"]*")?/g;
    let match;

    while ((match = wbRegex.exec(htmlCode)) !== null) {
      const fullAttribute = match[0];
      const [name, value] = fullAttribute.split("=");

      if (!seenAttributes.has(name)) {
        seenAttributes.add(name);
        wbAttributes.push({
          name: name,
          value: value ? value.replace(/"/g, "") : null,
        });
      }
    }

    return wbAttributes;
  };

  /* ═══════════════════════════════════════════════════════
     ConfigSidebar Handlers (passed via props)
     ═══════════════════════════════════════════════════════ */

  const handleToggleAttribute = useCallback((attrName, checked) => {
    setActiveAttributes((prev) => ({ ...prev, [attrName]: checked }));
  }, []);

  const handleChangeValue = useCallback((attrName, newValue) => {
    setAttributeValues((prev) => ({ ...prev, [attrName]: newValue }));
  }, []);

  /* ═══════════════════════════════════════════════════════
     Render — Preview Content (center column)
     ═══════════════════════════════════════════════════════ */

  // Attribute pills, bottom-left of the preview: click a name or value to copy it.
  const renderAttributePills = (wbAttributes) =>
    wbAttributes.length > 0 && (
      <div className="absolute bottom-0 left-0 flex flex-wrap gap-2 p-2 sm:p-4  z-10 max-w-none">
            {wbAttributes.map((attr, attrIndex) => (
              <div
                key={attrIndex}
                className="inline-flex items-center gap-0 sm:gap-0 px-1.5 sm:px-[0.625rem] py-0.5 sm:py-[0.375rem] rounded border border-foreground/10 bg-base-high text-text-medium text-attribute max-w-[300px] overflow-ellipsis"
              >
                <span
                  className="cursor-pointer hover:text-textLow transition-colors duration-200 relative group inline-flex max-w-[130px]"
                  title={attr.name}
                  onClick={() =>
                    copyToClipboard(attr.name, `attrName_${attrIndex}`)
                  }
                >
                  <span className="truncate whitespace-nowrap block">
                    {attr.name}
                  </span>
                  {/* Tooltip for attribute name */}
                  <div className="absolute bottom-[calc(100%+6px)] left-1/2 transform -translate-x-1/2 mb-2 px-[0.625rem] py-[0.375rem] text-tooltip text-background bg-foreground rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    {copyStates[`attrName_${attrIndex}`]
                      ? "Copied!"
                      : "Click to copy"}
                  </div>
                </span>
                {attr.value && (
                  <>
                    <span className="mx-1 text-muted-foreground shrink-0">
                      =
                    </span>
                    <span
                      className="cursor-pointer hover:text-textLow transition-colors duration-200 relative group flex-1 min-w-0"
                      title={attr.value}
                      onClick={() =>
                        copyToClipboard(attr.value, `attrValue_${attrIndex}`)
                      }
                    >
                      <span className="truncate whitespace-nowrap block">
                        {attr.value}
                      </span>
                      {/* Tooltip for attribute value */}
                      <div className="absolute bottom-[calc(100%+6px)] left-1/2 transform -translate-x-1/2 mb-2 px-[0.625rem] py-[0.375rem] text-tooltip text-background bg-foreground rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                        {copyStates[`attrValue_${attrIndex}`]
                          ? "Copied!"
                          : "Click to copy"}
                      </div>
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
    );

  const renderPreviewContent = () => {
    const currentCode = generateUpdatedCode();
    const wbAttributes = extractWbAttributes(currentCode);

    // Themed effects: the card's surface fills the panel, and the markup renders in a 4:3 stage
    // fitted inside it (contain). The stage is the same size container as the card, so its
    // cqw-based art direction lays out 1:1 with the gallery, just larger.
    if (theme) {
      return (
        <div
          id={`card-${componentName}`}
          className="relative h-full min-h-[300px] sm:min-h-[400px] overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: theme.background, containerType: "size" }}
        >
          {theme.image && (
            <img
              src={theme.image}
              alt=""
              aria-hidden="true"
              className="absolute max-w-none w-[227%] h-[170%] left-[-69%] top-[-3%] origin-top-left -rotate-[5.56deg] object-cover pointer-events-none"
            />
          )}
          <div
            className="relative aspect-[4/3]"
            style={{ width: "min(100cqw, 133.333cqh)", containerType: "inline-size" }}
          >
            <div
              key={reloadKey}
              className={`w-full h-full flex items-center justify-center text-center ${
                theme.fill ? "" : "p-[5.37cqw]"
              }`}
              dangerouslySetInnerHTML={{ __html: currentCode }}
            />
          </div>
          {renderAttributePills(wbAttributes)}
        </div>
      );
    }

    return (
      <div
        className={`relative px-2 md:p-4 sm:p-8 overflow-hidden min-h-[300px] sm:min-h-[400px] lg:min-h-[470px] h-full flex items-center justify-center
        ${component.category === "background" ? "lg:px-4" : "lg:p-12"}`}
      >
        {renderAttributePills(wbAttributes)}

        <div
          key={reloadKey}
          className={`text-center [&_*]:font-medium ${component.category === "background" ? "h-full w-full" : ""}`}
          dangerouslySetInnerHTML={{ __html: currentCode }}
        />
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════
     404 Guard
     ═══════════════════════════════════════════════════════ */

  if (!component) {
    return (
      <div className="text-foreground min-h-[60dvh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Component Not Found</h1>
          <p className="text-muted-foreground">
            The component &ldquo;{componentName}&rdquo; could not be found.
          </p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     SEO Structured Data
     ═══════════════════════════════════════════════════════ */

  const pageSeo = seoPages.componentDetail(
    component.name,
    component.description,
    componentName,
    component.category
  );
  const structuredData = jsonLd.component(
    component.name,
    component.description,
    componentName,
    component.category
  );

  /* ═══════════════════════════════════════════════════════
     Main Render — preview + attribute editor
     ═══════════════════════════════════════════════════════ */

  // Desktop: the page is exactly one viewport tall. Header takes its natural height, the
  // preview + editor row fills the rest, and the editor scrolls inside itself.
  return (
    <div className="flex flex-col lg:h-dvh">
      <SEO
        title={pageSeo.title}
        description={pageSeo.description}
        keywords={pageSeo.keywords}
        image="https://www.slabpixel.dev/images/FlowBitz-OpenGraph.webp"
        url={`https://www.flowbitz.dev/components/${componentName}`}
        structuredData={structuredData}
      />
      <PageHeader title={component.name} description={component.description}>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => installModal.setOpen(true)}
            className="flex items-center gap-2 px-3 bg-white rounded-[26px] text-[15px] leading-7 text-black/60 hover:text-black transition-colors"
          >
            <Code className="w-4 h-4" />
            Installation guide
          </button>
          <button
            onClick={reloadPreview}
            title="Reload animation"
            className="flex items-center gap-2 px-3 bg-white rounded-[26px] text-[15px] leading-7 text-black/60 hover:text-black transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            Replay
          </button>
        </div>
      </PageHeader>

      <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-4 items-stretch lg:flex-1 lg:min-h-0">
        {/* Preview */}
        <section className="flex-1 min-w-0 bg-white rounded-lg overflow-hidden flex">
          <div className="w-full">{renderPreviewContent()}</div>
        </section>

        {/* Attribute editor */}
        <ConfigSidebar
          isMobile={false}
          component={component}
          activeAttributes={activeAttributes}
          attributeValues={attributeValues}
          onToggleAttribute={handleToggleAttribute}
          onChangeValue={handleChangeValue}
        />
      </div>
    </div>
  );
};

export default ComponentDetail;
