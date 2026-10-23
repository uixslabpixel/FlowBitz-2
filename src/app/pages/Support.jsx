import React from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, Mail, Heart, Globe } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import SEO from "../components/SEO.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { seoPages, jsonLd } from "../content/brandCopy.js";

const Support = () => {
  const navigate = useNavigate();

  const handleFAQ = () => {
    navigate("/faq");
  };

  const handleBugReport = () => {
    navigate("?feedback=report");
  };

  const handleFeatureRequest = () => {
    navigate("?feedback=feature");
  };

  const handleEmail = () => {
    navigate("?feedback=contact");
  };

  const handleGitHub = () => {
    window.open("https://github.com/Slabpixel/FlowBitz", "_blank");
  };

  const handleSlabPixel = () => {
    window.open("https://www.slabpixel.com/", "_blank");
  };

  const handleDonate = () => {
    window.open("https://paypal.me/slabpixel", "_blank");
  };

  const handleComponents = () => {
    navigate("/components");
  };

  const structuredData = jsonLd.support;

  return (
    <>
      <SEO
        title={seoPages.support.title}
        description={seoPages.support.description}
        keywords={seoPages.support.keywords}
        image="https://www.slabpixel.dev/images/FlowBitz-OpenGraph.webp"
        url="https://www.flowbitz.dev/support"
        structuredData={structuredData}
      />
      <PageHeader
        title="Support & Help"
        description="Documentation, bugs, and feature requests for the FlowBitz motion system—support for serious Webflow creators."
      />
      <div className="p-4 lg:p-6 flex flex-col gap-8 max-w-[960px]">

            <div className="w-full max-w-[800px]">
              {/* Support Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-4">
                {/* FAQ */}
                <div className="group relative flex flex-col gap-[0.875rem] p-[0.875rem] bg-white rounded-lg">
                  <div className="relative z-[2] flex gap-2 items-center py-1.5">
                    <HelpCircle
                      className="w-4 h-4 opacity-60"
                    />
                    <h3 className="text-paragraph highlight text-foreground">
                      FAQ
                    </h3>
                  </div>

                  <p className="relative z-[2] text-paragraph large text-textLow flex-1">
                    Find answers to common questions about FlowBitz components
                  </p>

                  <Button
                    onClick={handleFAQ}
                    variant="custom"
                    size="custom"
                    className="w-full rounded-[2px] bg-background/40 border border-foreground/10 px-3 flex items-center gap-2 text-link font-medium text-foreground h-8 relative z-[2]"
                  >
                    <HelpCircle
                      className="w-[0.875rem] h-[0.875rem] opacity-60"
                    />
                    Browse FAQ
                  </Button>

                  <img
                    src="/images/support-card-gradient.svg"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[1] pointer-events-none"
                    loading="lazy"
                  />
                </div>

                {/* Email Support */}
                <div className="group relative flex flex-col gap-[0.875rem] p-[0.875rem] bg-white rounded-lg">
                  <div className="relative z-[2] flex gap-2 items-center py-1.5">
                    <Mail
                      className="w-4 h-4 opacity-60"
                    />
                    <h3 className="text-paragraph highlight text-foreground">
                      Email Support
                    </h3>
                  </div>

                  <p className="relative z-[2] text-paragraph large text-textLow flex-1">
                    Get direct help from our support team
                  </p>

                  <Button
                    onClick={handleEmail}
                    variant="custom"
                    size="custom"
                    className="w-full rounded-[2px] bg-background/40 border border-foreground/10 px-3 flex items-center gap-2 text-link font-medium text-foreground h-8 relative z-[2]"
                  >
                    <Mail
                      className="w-[0.875rem] h-[0.875rem] opacity-60"
                    />
                    Send Email
                  </Button>

                  <img
                    src="/images/support-card-gradient.svg"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[1] pointer-events-none"
                    loading="lazy"
                  />
                </div>

                {/* GitHub */}
                <div className="group relative flex flex-col gap-[0.875rem] p-[0.875rem] bg-white rounded-lg">
                  <div className="relative z-[2] flex gap-2 items-center py-1.5">
                    <FontAwesomeIcon
                      icon={["fab", "github"]}
                      className="w-4 h-4 opacity-60"
                    />
                    <h3 className="text-paragraph highlight text-foreground">
                      GitHub
                    </h3>
                  </div>

                  <p className="relative z-[2] text-paragraph large text-textLow flex-1">
                    Report bugs and request features on GitHub
                  </p>

                  <Button
                    onClick={handleGitHub}
                    variant="custom"
                    size="custom"
                    className="w-full rounded-[2px] bg-background/40 border border-foreground/10 px-3 flex items-center gap-2 text-link font-medium text-foreground h-8 relative z-[2]"
                  >
                    <FontAwesomeIcon
                      icon={["fab", "github"]}
                      className="w-[0.875rem] h-[0.875rem] opacity-60"
                    />
                    View Repository
                  </Button>

                  <img
                    src="/images/support-card-gradient.svg"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[1] pointer-events-none"
                    loading="lazy"
                  />
                </div>

                {/* Support Us */}
                <div className="group relative flex flex-col gap-[0.875rem] p-[0.875rem] bg-white rounded-lg">
                  <div className="relative z-[2] flex gap-2 items-center py-1.5">
                    <Heart
                      className="w-4 h-4 opacity-60"
                    />
                    <h3 className="text-paragraph highlight text-foreground">
                      Support Us
                    </h3>
                  </div>

                  <p className="relative z-[2] text-paragraph large text-textLow flex-1">
                    Help us keep FlowBitz free and open source
                  </p>

                  <Button
                    onClick={handleDonate}
                    variant="custom"
                    size="custom"
                    className="w-full rounded-[2px] bg-background/40 border border-foreground/10 px-3 flex items-center gap-2 text-link font-medium text-foreground h-8 relative z-[2]"
                  >
                    <Heart
                      className="w-[0.875rem] h-[0.875rem] opacity-60"
                    />
                    Donate via PayPal
                  </Button>

                  <img
                    src="/images/support-card-gradient.svg"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[1] pointer-events-none"
                    loading="lazy"
                  />
                </div>

                {/* Visit SlabPixel */}
                <div className="group relative flex flex-col gap-[0.875rem] p-[0.875rem] bg-white rounded-lg">
                  <div className="relative z-[2] flex gap-2 items-center py-1.5">
                    <img
                      src="/images/slabpixel.svg"
                      alt="SlabPixel"
                      className="w-4 h-4 opacity-60"
                    />
                    <h3 className="text-paragraph highlight text-foreground">
                      Visit SlabPixel
                    </h3>
                  </div>

                  <p className="relative z-[2] text-paragraph large text-textLow flex-1">
                    Learn more about our team
                  </p>

                  <Button
                    onClick={handleSlabPixel}
                    variant="custom"
                    size="custom"
                    className="w-full rounded-[2px] bg-background/40 border border-foreground/10 px-3 flex items-center gap-2 text-link font-medium text-foreground h-8 relative z-[2]"
                  >
                    <Globe
                      className="w-[0.875rem] h-[0.875rem] opacity-60"
                    />
                    Visit Website
                  </Button>

                  <img
                    src="/images/support-card-gradient.svg"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[1] pointer-events-none"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
      </div>
    </>
  );
};

export default Support;
