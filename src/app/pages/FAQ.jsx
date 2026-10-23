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

  const faqItems = [
    // Installation
    {
      question: "How do I install FlowBitz components?",
      answer:
        "Add one FlowBitz script tag in your Webflow project custom code, then set wb-component and related wb-* attributes on elements. One script, consistent motion across pages.",
      category: "installation",
    },
    {
      question: "Do I need to install GSAP separately?",
      answer:
        "No! FlowBitz includes GSAP and all necessary plugins bundled in. Just add our single script tag and everything will work automatically.",
      category: "installation",
    },
    {
      question: "Can I use FlowBitz with other frameworks besides Webflow?",
      answer:
        "FlowBitz is specifically designed for Webflow, but the core JavaScript can be adapted for other frameworks. However, we recommend using it with Webflow for the best experience.",
      category: "installation",
    },
    {
      question: "What's the difference between the UMD and ES module versions?",
      answer:
        "The UMD version works in any environment and is recommended for most users. The ES module version is for modern bundlers. For Webflow, use the UMD version.",
      category: "installation",
    },

    // Usage
    {
      question: "Do I need to know JavaScript to use FlowBitz?",
      answer:
        "You do not need to write custom GSAP or JavaScript. FlowBitz is configured with wb-* attributes in Webflow—different from maintaining your own animation codebase on every project.",
      category: "usage",
    },
    {
      question: "How do I add a component to my Webflow project?",
      answer:
        "1. Add the FlowBitz script to your project's custom code section. 2. Select any text element in Webflow. 3. Go to Element Settings → Custom Attributes. 4. Add 'wb-component' as the attribute name and the component name (like 'split-text') as the value. 5. Publish your site!",
      category: "usage",
    },
    {
      question: "Can I use multiple components on the same page?",
      answer:
        "Yes, you can use multiple components on the same page, but we recommend limiting it to 2-3 components to maintain good performance and user experience.",
      category: "usage",
    },
    {
      question: "Will FlowBitz work on mobile devices?",
      answer:
        "Yes, all components are fully responsive and optimized for mobile devices. However, consider disabling some effects on mobile for better performance using Webflow's responsive design features.",
      category: "usage",
    },

    // Customization
    {
      question: "Can I customize the animations?",
      answer:
        "Absolutely! Each component comes with various attributes to customize timing, easing, colors, and behavior. Check the component documentation for all available customization options.",
      category: "customization",
    },
    {
      question: "How do I change animation timing and delays?",
      answer:
        "Most components have attributes like 'wb-delay', 'wb-duration', and 'wb-stagger-delay' that let you control timing. Check each component's documentation for specific attributes.",
      category: "customization",
    },
    {
      question: "Can I change colors and styling?",
      answer:
        "Yes! Many components support color customization through attributes like 'wb-color', 'wb-gradient', and 'wb-text-color'. You can also use CSS to override styles if needed.",
      category: "customization",
    },
    {
      question: "How do I make animations trigger on scroll?",
      answer:
        "Most components automatically trigger on scroll by default. You can control this with attributes like 'wb-trigger' and 'wb-scroll-offset' to customize when animations start.",
      category: "customization",
    },

    // Troubleshooting
    {
      question: "My animations aren't working. What should I check?",
      answer:
        "1. Make sure the FlowBitz script is loaded. 2. Check that you have the correct wb-component attribute. 3. Verify the component name is spelled correctly. 4. Check browser console for errors. 5. Ensure your element has text content.",
      category: "troubleshooting",
    },
    {
      question: "The component is working but looks different than expected.",
      answer:
        "This is usually due to CSS conflicts. Check if your Webflow styles are overriding FlowBitz styles. Try adding !important to FlowBitz styles or adjusting your CSS specificity.",
      category: "troubleshooting",
    },
    {
      question: "Animations are slow or choppy on mobile.",
      answer:
        "This is common on mobile devices. Consider reducing the number of components, using simpler animations, or disabling effects on mobile using Webflow's responsive design features.",
      category: "troubleshooting",
    },
    {
      question: "The component doesn't work with certain Webflow elements.",
      answer:
        "FlowBitz works best with text elements. Some complex Webflow elements or nested structures might not work properly. Try using simpler text elements or check the component documentation for compatibility notes.",
      category: "troubleshooting",
    },

    // General
    {
      question: "Are FlowBitz components free to use?",
      answer:
        "Yes—the core FlowBitz library is free and open source for personal and commercial Webflow projects. Use, modify, and distribute per the MIT license.",
      category: "general",
    },
    {
      question: "Can I use FlowBitz in commercial projects?",
      answer:
        "Absolutely! FlowBitz is free for both personal and commercial use. There are no licensing restrictions or fees.",
      category: "general",
    },
    {
      question: "How can I contribute to FlowBitz?",
      answer:
        "We welcome contributions! You can report bugs, suggest features, or submit pull requests on our GitHub repository. Check our contributing guidelines for more information.",
      category: "general",
    },
    {
      question: "Will there be more components added?",
      answer:
        "Yes! We're constantly working on new components and improvements. Follow our GitHub repository to stay updated with the latest releases and announcements.",
      category: "general",
    },
    {
      question: "How do I get support if I can't find the answer here?",
      answer:
        "If you can't find the answer in our FAQ, you can contact us through our support page, open an issue on GitHub, or reach out to us at hello@slabpixel.com.",
      category: "general",
    },
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
    navigate("/contact?tab=contact");
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
