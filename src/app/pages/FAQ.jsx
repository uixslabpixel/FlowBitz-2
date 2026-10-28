import React, { useState } from "react";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Github,
  Bug,
  Heart,
  Wrench,
  Lightbulb,
  Palette,
  Settings,
  HelpCircle as GeneralHelp,
  Mail,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import SEO from "../components/SEO.jsx";
import { useNavigate } from "react-router-dom";
import { seoPages, jsonLd } from "../content/brandCopy.js";
import { faqItems } from "../content/faq.js";

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});
  const navigate = useNavigate();

  const toggleItem = (index) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const faqCategories = [
    { key: "installation", label: "Installation", icon: Wrench },
    { key: "usage", label: "Usage", icon: Lightbulb },
    { key: "customization", label: "Customization", icon: Palette },
    { key: "troubleshooting", label: "Troubleshooting", icon: Settings },
    { key: "general", label: "General", icon: GeneralHelp },
  ];


  const groupedItems = faqCategories
    .map((category) => ({
      ...category,
      items: faqItems.filter((item) => item.category === category.key),
    }))
    .filter((category) => category.items.length > 0);

  const handleBugReport = () => {
    window.open(
      "https://github.com/Slabpixel/FlowBitz/issues/new?template=bug_report.md&title=%5BBUG%5D%3A%20General-Report&labels=bug",
      "_blank",
    );
  };

  const handleFeatureRequest = () => {
    window.open(
      "https://github.com/Slabpixel/FlowBitz/issues/new?template=feature_request.md&title=%5BFEAT%5D%3A%20Feature-Request&labels=enhancement",
      "_blank",
    );
  };

  const handleContactSupport = () => {
    navigate("?feedback=contact");
  };

  const structuredData = {
    ...jsonLd.faq,
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <SEO
        title={seoPages.faq.title}
        description={seoPages.faq.description}
        keywords={seoPages.faq.keywords}
        image="https://www.slabpixel.dev/images/FlowBitz-OpenGraph.webp"
        url="https://www.flowbitz.dev/faq"
        structuredData={structuredData}
      />
      <PageHeader
        title="Frequently Asked Questions"
        description="Help with installing FlowBitz, wb-* attributes, performance, and troubleshooting—built for serious Webflow creators."
      />
      <div className="p-4 lg:p-6 flex flex-col gap-8 max-w-[960px]">

            <div className="w-full max-w-[800px]">
              {/* FAQ Items */}
              <div className="mx-auto flex flex-col gap-8">
                {groupedItems.length > 0 &&
                  groupedItems.map((category) => (
                    <div key={category.key} className="flex flex-col gap-4">
                      {/* Category Header */}
                      <div className="flex items-center gap-1">
                        <h3 className="text-heading-small text-foreground">
                          {category.label}
                        </h3>

                        <p className="text-link font-medium text-textLow">
                          • {category.items.length}
                        </p>
                      </div>

                      {/* Category Items */}
                      <div className="space-y-3">
                        {category.items.map((item, index) => {
                          const globalIndex = faqItems.findIndex(
                            (faqItem) => faqItem === item,
                          );
                          return (
                            <div
                              key={globalIndex}
                              className="bg-base-medium rounded p-4 hover:bg-base-high transition-all duration-300"
                            >
                              <div
                                className="cursor-pointer"
                                onClick={() => toggleItem(globalIndex)}
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="inter-med-16 pr-4 text-foreground">
                                    {item.question}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    {openItems[globalIndex] ? (
                                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              {openItems[globalIndex] && (
                                <div className="mt-4 pt-4">
                                  <div className="prose prose-sm max-w-none text-paragraph font-medium text-text-medium">
                                    <p className="whitespace-pre-line">
                                      {item.answer}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="relative flex flex-col gap-4 px-4 py-6 md:p-6 bg-base-medium rounded w-full max-w-[800px]">
              <h4 className="relative z-[2] text-heading-small text-foreground">
                Still Need Help?
              </h4>

              <p className="relative z-[2] text-paragraph text-foreground/60">
                Can't find the answer you're looking for? We're here to help!
              </p>

              <div className="relative z-[2] flex flex-wrap gap-2 items-start justify-start">
                <Button
                  onClick={handleContactSupport}
                  variant="custom"
                  size="custom"
                  className="flex items-center gap-2 px-3 py-[0.625rem] rounded-lg bg-background border border-foreground/10 text-link font-medium"
                >
                  <Mail
                    className="w-4 h-4 opacity-60"
                  />
                  Contact Support
                </Button>

                <Button
                  onClick={handleBugReport}
                  variant="custom"
                  size="custom"
                  className="flex items-center gap-2 px-3 py-[0.625rem] rounded-lg bg-background border border-foreground/10 text-link font-medium"
                >
                  <Bug
                    className="w-4 h-4 opacity-60"
                  />
                  Report Bug
                </Button>

                <Button
                  onClick={handleFeatureRequest}
                  variant="custom"
                  size="custom"
                  className="flex items-center gap-2 px-3 py-[0.625rem] rounded-lg bg-background border border-foreground/10 text-link font-medium"
                >
                  <Sparkles
                    className="w-4 h-4 opacity-60"
                  />
                  Request Feature
                </Button>
              </div>

              <img
                src="/images/group.svg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover z-[1] pointer-events-none"
                loading="lazy"
              />
            </div>
      </div>
    </>
  );
};

export default FAQ;
