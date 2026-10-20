import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getComponent } from "../../library/data/componentsMetadata.js";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import ConfigSidebar from "../components/layout/RightSidebar.jsx";
import SEO from "../components/SEO.jsx";
import { Copy, RotateCcw, Download, Code, RotateCw } from "lucide-react";
import { useWebflowBits } from "../hooks/useWebflowBits";
import { seoPages, jsonLd } from "../content/brandCopy.js";

const ComponentDetail = () => {
  const { componentName } = useParams();
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  const [copyStates, setCopyStates] = useState({});
  const [activeAttributes, setActiveAttributes] = useState({});
  const [attributeValues, setAttributeValues] = useState({});
  const { reinitializeComponents } = useWebflowBits();

  // Get component metadata
  const component = getComponent(componentName);

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
        const isInExample = component.example.code.includes(attr.name);
        initialAttributes[attr.name] = isInExample;

        // Extract value from example code if present, otherwise use default
        if (isInExample) {
          const valueMatch = component.example.code.match(
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
  }, [component]);

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

  // Generate updated HTML code based on active attributes and values
  const generateUpdatedCode = () => {
    const baseCode = component.example.code;

    // Find the element that has wb-component attribute (the actual component element)
    const componentMatch = baseCode.match(
      /<(\w+)[^>]*wb-component="[^"]*"[^>]*>/,
    );

    if (componentMatch) {
      const componentTag = componentMatch[0];
      const activeAttrList = [];

      // Add active attributes with their current values (excluding wb-component)
      component.attributes.forEach((attr) => {
        if (activeAttributes[attr.name] && attr.name !== "wb-component") {
          const value = attributeValues[attr.name] || attr.default || "true";
          activeAttrList.push(`${attr.name}="${value}"`);
        }
      });

      const attributesString =
        activeAttrList.length > 0 ? " " + activeAttrList.join(" ") : "";

      // Clean up the component tag and add new attributes
      let cleanTag = componentTag.replace(/wb-[\w-]+="[^"]*"/g, "").trim();
      if (cleanTag.endsWith(">")) {
        cleanTag = cleanTag.slice(0, -1);
      }

      // Always add wb-component attribute
      cleanTag +=
        ' wb-component="' +
        (attributeValues["wb-component"] || componentName) +
        '"';
      cleanTag += attributesString + ">";

      return baseCode.replace(componentTag, cleanTag);
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

  const renderPreviewContent = () => {
    const currentCode = generateUpdatedCode();
    const wbAttributes = extractWbAttributes(currentCode);

    return (
      <div
        className={`relative px-2 md:p-4 sm:p-8 overflow-hidden min-h-[300px] sm:min-h-[400px] lg:min-h-[470px] h-full flex items-center justify-center
        ${component.category === "background" ? "lg:px-4" : "lg:p-12"}`}
      >
        {/* Attributes Pills - Bottom Left */}
        {wbAttributes.length > 0 && (
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
        )}

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

  return (
    <>
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
            onClick={() => navigate("/installation")}
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

      <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Preview */}
        <section className="flex-1 min-w-0 bg-white rounded-lg overflow-hidden lg:min-h-[calc(100dvh-140px)] flex">
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
    </>
  );
};

export default ComponentDetail;
