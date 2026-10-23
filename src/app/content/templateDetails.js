// Template catalogue: CMS JSON (name, cover, hover, tags, links) merged with detail-page copy.
// The detail fields below are placeholder content until they move into the CMS (.pages.yml).

const CMS = Object.values(
  import.meta.glob("./templates/*.json", { eager: true, import: "default" }),
);

export const slugify = (name) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const DUMMY = {
  subtitle: "Webflow Portfolio Template",
  price: "$49",
  info: "A Webflow template for studios and individuals who value restraint, clarity, and focus. Built on a minimal framework with purposeful details, it lets your work take center stage.",
  features: ["Dynamic CMS", "Custom animations", "Custom interactions", "Custom components"],
  pages: ["Home", "About", "Work", "Work Detail", "Contact", "404"],
  platform: "Webflow",
};

// `keywords` only show on the detail popup; the gallery's filter chips still come from CMS `tags`.
const DETAILS = {
  clarity: {
    subtitle: "Webflow SaaS Template",
    price: "$59",
    keywords: ["SaaS", "Startup", "Enterprise", "B2B", "Landing Page", "Dark", "Corporate", "Technology", "Fintech", "Pricing", "Blog", "CMS", "Animations", "Interactions", "Responsive", "Modern"],
  },
  haventlist: {
    subtitle: "Webflow Directory Template",
    price: "$39",
    keywords: ["Real Estate", "Directory", "Listings", "Property", "Architecture", "Filters", "Search", "Marketplace", "Minimal", "Light", "CMS", "Map", "Booking", "Responsive", "Modern"],
  },
  nexus: {
    subtitle: "Webflow Agency Template",
    price: "$79",
    keywords: ["Agency", "Developer Tools", "AI", "SaaS", "Product", "Gradient", "Light", "Startup", "Dashboard", "Pricing", "Testimonials", "CMS", "Interactions", "Responsive", "New"],
  },
  stillmind: {
    subtitle: "Webflow Wellness Template",
    price: "$49",
    keywords: ["Wellness", "Health", "Therapy", "Mental Health", "Clinic", "Booking", "Calm", "Editorial", "Elegant", "Serif", "Blog", "Resources", "CMS", "Animations", "Responsive"],
  },
};

export const TEMPLATES = CMS.map((t) => {
  const slug = slugify(t.name);
  return { ...DUMMY, ...DETAILS[slug], ...t, slug };
}).sort((a, b) => a.name.localeCompare(b.name));

export const getTemplate = (slug) => TEMPLATES.find((t) => t.slug === slug);

