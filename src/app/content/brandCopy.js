/**
 * FlowBitz brand copy — single source for marketing voice and SEO defaults.
 * Keep in sync: index.html, public/manifest.json (static fallbacks before SPA load).
 * Strategy: docs/BRAND.md
 */

export const brandName = 'FlowBitz'

export const categoryLine = 'Premium UI Motion System for Webflow'

export const corePromise =
  'Premium motion for serious Webflow creators—without the custom animation grind.'

export const valueProp =
  'FlowBitz helps serious Webflow creators build premium-feeling websites faster.'

export const keywordBaseline =
  'FlowBitz, webflow motion, premium webflow animations, GSAP for Webflow, webflow HTML attributes, wb attributes, webflow text effects, webflow hover effects, webflow scroll animations, motion system, free webflow components'

export const seoDefaults = {
  title: `${brandName} — ${categoryLine}`,
  description:
    'Ship premium text, hover, and scroll motion in Webflow. Attribute-based motion system powered by GSAP—free core library, built for serious creators.',
  keywords: keywordBaseline,
  ogImage: 'https://www.slabpixel.dev/images/FlowBitz-OpenGraph.webp',
  siteUrl: 'https://www.flowbitz.dev',
  author: 'SlabPixel Studio',
}

export const seoPages = {
  home: (count) => ({
    title: seoDefaults.title,
    description: `Ship premium text, hover, and scroll motion in Webflow. ${count}+ motion components with wb-* attributes—GSAP-powered, free core library for serious creators.`,
    keywords: keywordBaseline,
  }),

  components: (count) => ({
    title: `Motion Components for Webflow — ${brandName} (${count}+)`,
    description: `Browse ${count}+ premium motion components for Webflow—text, hover, and scroll effects via wb-* attributes. GSAP-powered system for freelancers and agencies.`,
    keywords:
      'FlowBitz components, webflow motion components, premium webflow animations, webflow text effects, webflow hover effects, GSAP for Webflow, free webflow components',
  }),

  componentDetail: (name, description, slug, category) => ({
    title: `${name} — Premium Webflow Motion — ${brandName}`,
    description: `${description} Configure with wb-* attributes in Webflow. GSAP-powered where needed.`,
    keywords: `FlowBitz, ${slug}, ${category}, premium webflow motion, GSAP for Webflow, webflow HTML attributes, ${name.toLowerCase()}`,
  }),

  about: {
    title: `About ${brandName} — Effects, Templates and Tools for Building Websites`,
    description:
      'FlowBitz collects the effects, templates and tools SlabPixel Studio built for client projects and team experiments, shared for anyone building websites.',
    keywords:
      'about FlowBitz, website effects, website templates, web design tools, GSAP animations, SlabPixel Studio, freelancers, agencies',
  },

  installation: {
    title: `Installation — ${brandName} | Add Premium Motion to Webflow`,
    description:
      'Install FlowBitz in Webflow: one script, wb-* attributes, premium motion on your next project. Step-by-step guide for serious creators.',
    keywords:
      'FlowBitz installation, webflow custom code, FlowBitz script, wb attributes, webflow GSAP motion, premium webflow animations',
  },

  faq: {
    title: `FAQ — ${brandName} | Webflow Motion Help`,
    description:
      'Answers on installing and using FlowBitz—premium motion components for Webflow. Setup, wb-* attributes, performance, and troubleshooting.',
    keywords:
      'FlowBitz FAQ, webflow motion help, FlowBitz installation, webflow GSAP components, wb attributes support',
  },

  showcase: {
    title: `Showcase — ${brandName} | Premium Webflow Sites`,
    description:
      'Real Webflow projects built with FlowBitz—see how teams ship polished, premium motion with our motion system.',
    keywords:
      'FlowBitz showcase, premium webflow sites, webflow motion examples, FlowBitz projects, GSAP webflow',
  },

  blog: {
    title: `${brandName} Blog | Motion Craft, Tutorials & Release Notes`,
    description:
      'Tutorials, release notes, and motion workflows for serious Webflow creators—ship premium GSAP-style effects with FlowBitz.',
    keywords:
      'FlowBitz blog, webflow motion tutorials, FlowBitz release notes, GSAP for Webflow, webflow motion workflows',
  },

  support: {
    title: `Support — ${brandName} | Docs, Bugs & Features`,
    description:
      'Get help with FlowBitz—documentation, bug reports, and feature requests for your Webflow motion workflow.',
    keywords:
      'FlowBitz support, webflow motion help, FlowBitz documentation, bug report, feature request',
  },

  contact: {
    title: `Contact ${brandName} | Support, Bugs & Features`,
    description:
      'Reach the FlowBitz team for support, bug reports, or feature requests—built for serious Webflow creators.',
    keywords:
      'FlowBitz contact, webflow motion support, bug report, feature request, FlowBitz team',
  },

  release: {
    title: `Release Notes — ${brandName} | Version History`,
    description:
      'FlowBitz release notes and version history—what’s new in the premium motion system for Webflow.',
    keywords:
      'FlowBitz release notes, FlowBitz changelog, webflow motion updates, GSAP components for Webflow',
  },

  license: {
    title: `MIT License — ${brandName} | Usage Rights`,
    description:
      'FlowBitz MIT license—usage rights, commercial use, and guidelines for the Webflow motion system.',
    keywords:
      'FlowBitz license, MIT license, commercial use, webflow motion components',
  },

  notFound: {
    title: `404 — Page Not Found | ${brandName}`,
    description:
      'Page not found. Explore the FlowBitz motion library for Webflow or return to the homepage.',
    keywords: '404, FlowBitz, webflow motion components, premium webflow animations',
  },
}

export const jsonLd = {
  website: (count) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${brandName} — ${categoryLine}`,
    description: `Premium motion system for Webflow. ${count}+ components via wb-* attributes—GSAP-powered, free core library for serious creators.`,
    url: seoDefaults.siteUrl,
    publisher: {
      '@type': 'Organization',
      name: 'SlabPixel Studio',
      url: 'https://slabpixel.com',
      description:
        'Creative studio specializing in premium Webflow development and motion',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${seoDefaults.siteUrl}/components?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free core motion library for Webflow—premium components via wb-* attributes',
    },
    keywords:
      'webflow motion, premium webflow animations, gsap webflow, webflow text effects, motion system',
  }),

  about: {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${brandName}`,
    description:
      'Effects, templates and tools SlabPixel Studio built for client projects and team experiments, shared for anyone building websites.',
    url: `${seoDefaults.siteUrl}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: 'SlabPixel Studio',
      url: 'https://slabpixel.com',
      description: 'Small studio that designs and builds websites for clients',
    },
  },

  components: (count) => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brandName} Motion Components`,
    description: `${count}+ premium motion components for Webflow—text, hover, and scroll via wb-* attributes.`,
    url: `${seoDefaults.siteUrl}/components`,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Webflow Motion Components',
      description: 'Premium motion components for Webflow—text, buttons, and effects',
      numberOfItems: count,
    },
  }),

  component: (name, description, slug, category) => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${name} — ${brandName}`,
    description,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free core component in the FlowBitz motion system',
    },
    keywords: `webflow, ${slug}, ${category}, premium webflow motion, FlowBitz`,
  }),

  showcase: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brandName} Showcase`,
    description:
      'Premium Webflow sites and projects built with the FlowBitz motion system.',
    url: `${seoDefaults.siteUrl}/showcase`,
    mainEntity: {
      '@type': 'ItemList',
      name: 'FlowBitz Showcase Projects',
      description: 'Real-world premium Webflow builds using FlowBitz motion',
    },
  },

  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: `${brandName} FAQ`,
    description:
      'Help with FlowBitz—premium motion system for Webflow. Installation, wb-* attributes, and troubleshooting.',
    url: `${seoDefaults.siteUrl}/faq`,
  },

  support: {
    '@context': 'https://schema.org',
    '@type': 'SupportPage',
    name: `${brandName} Support`,
    description:
      'Support for FlowBitz—premium motion components for serious Webflow creators.',
    url: `${seoDefaults.siteUrl}/support`,
    mainEntity: {
      '@type': 'Organization',
      name: 'SlabPixel Studio',
      url: 'https://slabpixel.com',
    },
  },
}

/** Visible UI copy snippets */
export const uiCopy = {
  home: {
    badgePrefix: 'components available —',
    textRotator: [
      'Premium motion defaults',
      'Attribute-based in Webflow',
      'GSAP where it matters',
      'Built for client work',
      'Performance-conscious',
    ],
    headline: 'Premium motion for',
    headlineAccent: 'Webflow',
    subhead:
      'A growing motion system of text, hover, and scroll components. Drop in the script, set wb-* attributes, ship.',
    ctaHeadline: 'Client-ready motion.',
    ctaHeadlineLine2: 'Without the GSAP grind.',
  },
  components: {
    headline: 'Motion components for Webflow',
    subhead:
      'Premium text, hover, and scroll building blocks for serious creators—powered by GSAP, configured with wb-* attributes.',
  },
  footer: {
    tagline:
      'Premium UI motion for Webflow—craft interactions that feel studio-made.',
  },
  about: {
    headline: 'Premium motion for serious Webflow creators',
    subhead:
      'FlowBitz is a motion system that helps freelancers and agencies ship sophisticated interactions faster—without rebuilding GSAP on every project.',
    mission:
      'To make premium-quality web motion accessible to serious Webflow creators—fast to implement, reliable in production, and crafted for client work.',
    vision:
      'To become the default motion ecosystem for modern Webflow websites—where teams reach for FlowBitz when a project needs to feel premium.',
    ctaHeadline: 'Ready to elevate your next Webflow build?',
    ctaSubhead:
      'Explore the motion library and see how wb-* attributes deliver studio-grade effects—without a custom animation sprint.',
  },
}
