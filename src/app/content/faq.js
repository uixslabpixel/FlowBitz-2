// FAQ content, shared by the /faq page and the FAQ popup.

export const faqCategories = [
  { key: "start", label: "Getting started" },
  { key: "effects", label: "Effects" },
  { key: "templates-tools", label: "Templates and tools" },
  { key: "troubleshooting", label: "Troubleshooting" },
  { key: "general", label: "License and support" },
];

export const faqItems = [
  // Getting started
  {
    question: "What is FlowBitz?",
    answer:
      "A collection of effects, templates and tools our team built for client projects and our own experiments. Instead of using them once, we share them so others can use them too.",
    category: "start",
  },
  {
    question: "How do I add the effects to my site?",
    answer:
      "Add one script tag to your site, before the closing </body> tag. Then give an element the attribute wb-component with the effect's name as the value, for example wb-component=\"split-text\". Publish, and the effect runs.",
    category: "start",
  },
  {
    question: "Do I need to write code?",
    answer:
      "No. Effects are set up with attributes, so anything that lets you add a script and custom attributes to elements will work.",
    category: "start",
  },
  {
    question: "Do I need to install GSAP separately?",
    answer:
      "No. GSAP and the plugins the effects need are bundled into the FlowBitz script.",
    category: "start",
  },
  {
    question: "Which version of the script should I use?",
    answer:
      "Use the script tag (the UMD build) for most sites. If your project uses a bundler, there is also an ES module build.",
    category: "start",
  },

  // Effects
  {
    question: "Can I customize an effect?",
    answer:
      "Yes. Each effect has its own wb-* attributes for things like duration, easing, speed and colors, for example wb-duration, wb-ease or wb-colors. Every effect page lists the attributes it supports.",
    category: "effects",
  },
  {
    question: "Can effects start when they scroll into view?",
    answer:
      "Many do. Where an effect supports it, wb-trigger-on-view turns this on or off, and wb-root-margin sets how far into view the element must be before it starts.",
    category: "effects",
  },
  {
    question: "Can I use several effects on one page?",
    answer:
      "Yes. Each tagged element runs on its own. Heavier background effects draw on a canvas, so test the page on slower phones if you stack several of them.",
    category: "effects",
  },
  {
    question: "Do the effects work on phones?",
    answer:
      "Yes. If an effect feels heavy on small screens, hide that element or use a simpler version of it at that size with your own CSS.",
    category: "effects",
  },

  // Templates and tools
  {
    question: "What are the templates?",
    answer:
      "Complete website templates, sold individually. Each template page shows the price and what is included.",
    category: "templates-tools",
  },
  {
    question: "What are the tools?",
    answer:
      "Free web tools for making visuals, such as Banknote Engraver, Image Ink Bleed and LED Tile Maker. They open in your browser, with nothing to install.",
    category: "templates-tools",
  },

  // Troubleshooting
  {
    question: "An effect isn't running. What should I check?",
    answer:
      "1. The FlowBitz script is on the published page. 2. The element has the wb-component attribute. 3. The effect name is spelled exactly as on its page. 4. The browser console shows no errors.",
    category: "troubleshooting",
  },
  {
    question: "The effect runs but looks different from the preview.",
    answer:
      "Your site's own styles are usually the cause, such as font, line height, or overflow on a parent element. Check the effect page's notes, since some effects need a specific element or a set height.",
    category: "troubleshooting",
  },
  {
    question: "The page feels slow with effects on.",
    answer:
      "Use fewer canvas-based background effects on one page, and lower their particle count or speed where the effect has attributes for it.",
    category: "troubleshooting",
  },

  // License and support
  {
    question: "Is it free?",
    answer:
      "The effects library and the tools are free, and the effects library is open source under the MIT license. Templates are sold individually.",
    category: "general",
  },
  {
    question: "Can I use it on client projects?",
    answer:
      "Yes. The effects library is free for personal and commercial projects under the MIT license.",
    category: "general",
  },
  {
    question: "How can I contribute?",
    answer:
      "Report bugs, suggest features or open a pull request on the FlowBitz GitHub repository.",
    category: "general",
  },
  {
    question: "Where do I get help?",
    answer:
      "Send us a message from the sidebar, open an issue on GitHub, or email hello@slabpixel.com.",
    category: "general",
  },
];

// Questions grouped under their category, in category order.
export const faqGroups = faqCategories
  .map((category) => ({ ...category, items: faqItems.filter((item) => item.category === category.key) }))
  .filter((category) => category.items.length > 0);
