import type { Dictionary } from "./es"

/** Website copy in English. Must mirror the keys of es.ts exactly. */
export const en: Dictionary = {
  meta: {
    title: "B&G Consulting — Luxury real estate investment",
    description:
      "Access an exclusive selection of high-value real estate in Europe, Latin America and Dubai. Every opportunity analysed and validated by our team of advisors.",
    keywords:
      "B&G Consulting, luxury real estate investment, premium property, invest in property, international real estate opportunities, Marbella, Dubai",
    ogDescription:
      "An exclusive selection of high-value real estate in Europe, Latin America and Dubai, analysed with professional rigour.",
  },

  nav: {
    homeAria: "B&G Consulting — Home",
    howItWorks: "How it works",
    opportunities: "Opportunities",
    guides: "Guides",
    about: "About us",
    talkToAdvisor: "Speak with an advisor",
    language: "Language",
  },

  hero: {
    imageAlt: "Luxury villa with an infinity pool at sunset on the Costa del Sol",
    eyebrow: "Europe · Latin America · Dubai",
    title: "Exceptional real estate investments",
    body: "An exclusive selection of high-value assets, analysed and validated one by one by our team of advisors. Where wealth finds its best opportunity.",
    primary: "View opportunities",
    secondary: "Speak with an advisor",
    titleLead: "Exceptional real estate",
    titleAccent: "investments",
    videoLabel: "A walk through Villa Los Monteros, Marbella",
    scroll: "Discover",
  },

  home: {
    manifesto: {
      eyebrow: "How we work",
      text: "We don't publish endless catalogues. We study every asset one by one —location, title, potential and risk— and only present the ones that meet our standards.",
    },
    intro: {
      eyebrow: "B&G Consulting · Real estate investment advisory",
      title: "Real estate investment with judgement in Marbella, Latin America and Dubai",
      body: [
        "We select villas, luxury apartments, licensed land and industrial assets with verified potential. Every opportunity goes through a prior review of location, title, price and risk before it is published.",
        "Each asset comes with its own private dossier and an advisor who accompanies you from the first enquiry to closing, with the discretion a transaction of this level requires.",
      ],
      facts: {
        active: "Active opportunities",
        markets: "Markets",
        reviewed: "Assets reviewed before publication",
        languages: "Service in English and Spanish",
      },
      cta: "View the catalogue",
    },
    featured: {
      eyebrow: "Featured opportunity",
      cta: "View dossier",
      investment: "Investment",
    },
    rail: {
      eyebrow: "Current selection",
      title: "Validated opportunities",
      viewAll: "View the full catalogue",
      prev: "Previous",
      next: "Next",
    },
    ticker: {
      label: "Now in portfolio",
    },
  },

  credibility: {
    eyebrow: "How we work",
    items: [
      {
        title: "Curated selection",
        detail: "We only publish assets that pass our prior review of location, title and potential.",
      },
      {
        title: "Three markets",
        detail: "Coverage across Europe, Latin America and Dubai, with local expertise in every transaction.",
      },
      {
        title: "Personal guidance",
        detail: "A dedicated advisor from your first enquiry through to completion.",
      },
    ],
  },

  markets: {
    eyebrow: "Our markets",
    title: "Three regions, one standard",
    intro:
      "We select assets in international markets with proven potential, balancing capital preservation with opportunities for growth.",
    explore: "Explore",
    imageAlt: "Real estate investment in {name}",
    items: [
      {
        name: "Europe",
        location: "Costa del Sol · Madrid · Lisbon",
        description: "Established assets in the continent's most stable and sought-after markets.",
      },
      {
        name: "Latin America",
        location: "Tulum · Mexico City · Punta del Este",
        description: "High-growth opportunities in emerging luxury destinations.",
      },
      {
        name: "Dubai",
        location: "Palm Jumeirah · Downtown · Marina",
        description: "Strong returns in one of the world's most dynamic markets.",
      },
    ],
  },

  howItWorks: {
    eyebrow: "The process",
    title: "A discreet, rigorous process, tailored to you",
    steps: [
      {
        title: "We talk about your profile",
        description:
          "Through a natural conversation, we understand your budget, investment horizon and appetite for risk. No forms. No red tape.",
      },
      {
        title: "We show you validated assets",
        description:
          "Every property on our platform has been reviewed and approved by our team. We only work with opportunities that meet our criteria.",
      },
      {
        title: "A specialist guides you",
        description:
          "When you're ready to move forward, an advisor steps in to guide you. Professional judgement supports every decision through to completion.",
      },
    ],
  },

  showcase: {
    imageAlt: "Interior lounge of a luxury villa with sea views",
    eyebrow: "Our philosophy",
    title: "Excellence lies in the details",
    body: "We don't publish endless catalogues. We select a small number of extraordinary assets and give each one the analysis it deserves: returns, location, growth potential and risk, documented with the rigour your wealth demands.",
    items: [
      { k: "Curated selection", v: "Only assets that meet our investment criteria." },
      { k: "International reach", v: "Opportunities in Europe, Latin America and Dubai." },
      { k: "Expert guidance", v: "A dedicated advisor at every step of the transaction." },
    ],
    cta: "Explore the selection",
  },

  features: {
    eyebrow: "Why choose us",
    title: "Professional judgement for decisions that matter",
    items: [
      {
        title: "Professional analysis of every asset",
        description:
          "Every property goes through manual validation before it is published. Estimated return, risk and horizon, rigorously documented.",
      },
      {
        title: "Personal advice",
        description:
          "We guide you, answer your questions and understand your profile, so we only present what fits your investment goals.",
      },
      {
        title: "Professional judgement in every decision",
        description:
          "Every transaction goes through a specialist. Our process is designed so that professional judgement prevails at every step.",
      },
      {
        title: "Complete transparency",
        description:
          "You know exactly which assets are available, who validated them and what the associated risks are. No small print.",
      },
      {
        title: "A selection tailored to you",
        description:
          "We match opportunities to your budget, goals and risk appetite. You don't receive the whole catalogue, only what makes sense for you.",
      },
      {
        title: "Support through to completion",
        description:
          "When the time is right, a specialist who knows your profile accompanies you personally throughout the transaction.",
      },
    ],
  },

  faq: {
    eyebrow: "Frequently asked questions",
    title: "What investors usually ask us",
    items: [
      {
        question: "How do you select opportunities?",
        answer:
          "Every asset goes through a prior review of location, land-registry status and growth potential. We only publish those that pass, so you receive a few well-studied options rather than an endless catalogue.",
      },
      {
        question: "Which markets do you work in?",
        answer:
          "Europe, Latin America and Dubai. In each one we rely on local expertise to assess price, demand and regulation before presenting a transaction.",
      },
      {
        question: "What return can I expect?",
        answer:
          "It depends on the asset, the market and the timeframe, so we don't quote generic figures. For each specific opportunity we share the assumptions behind the numbers and the associated risks, so you can review them with your own tax or financial advisor.",
      },
      {
        question: "What is the minimum investment?",
        answer:
          "It varies with each transaction and how it is structured. Tell us your horizon and investment capacity and we'll guide you towards what fits your profile.",
      },
      {
        question: "How does the process start?",
        answer:
          "With an initial, no-obligation conversation. Based on your goals, an advisor guides you through shortlisting, viewings and completing the purchase.",
      },
    ],
  },

  cta: {
    eyebrow: "Your next investment",
    title: "Let us show you what few get to see",
    body: "We talk about your profile and present real opportunities, validated by our team. With complete discretion and no obligation.",
    primary: "Speak with an advisor",
    secondary: "View opportunities",
    footnote: "No sign-up · No obligation · Complete confidentiality",
  },

  footer: {
    tagline:
      "Exceptional real estate investments in Europe, Latin America and Dubai. Every opportunity analysed with professional rigour.",
    platform: "Platform",
    howItWorks: "How it works",
    opportunities: "Opportunities",
    guides: "Investment guides",
    talkToAdvisor: "Speak with an advisor",
    contact: "Contact",
    markets: "Markets",
    marketNames: ["Europe", "Latin America", "Dubai"],
    legal:
      "All investment involves risk. The information on this platform does not constitute financial advice or an offer to invest.",
  },

  opportunities: {
    metaTitle: "Real estate investment opportunities | Validated assets",
    metaDescription:
      "Explore real estate opportunities selected and validated one by one by our team across Europe, Latin America and Dubai.",
    eyebrow: "Catalogue · Verified assets",
    title: "Investment opportunities, selected one by one",
    intro:
      "Every asset has been reviewed and approved by our team before being published. Choose the one that fits your profile and go deeper with a dedicated advisor.",
    disclaimer:
      "The returns shown on each listing are estimates based on specific assumptions, not guaranteed results: a property's value can fluctuate and selling takes time. We recommend reviewing every transaction with your tax or financial advisor.",
    errorTitle: "We couldn't load the opportunities",
    errorBody:
      "We're experiencing technical difficulties. Please try again in a few minutes or speak directly with an advisor.",
    emptyTitle: "No opportunities published yet",
    emptyBody:
      "We're selecting the next assets. Share your profile and we'll let you know as soon as there are opportunities that suit you.",
    leaveProfile: "Share my profile",
    talkToAdvisor: "Speak with an advisor",
    validated: "Validated",
    investment: "Investment",
    horizon: "Horizon",
    viewOpportunity: "View opportunity",
  },

  property: {
    notFoundTitle: "Opportunity unavailable",
    notFoundBody:
      "This opportunity doesn't exist or is no longer available. Explore our other validated assets or speak with an advisor.",
    viewOpportunities: "View opportunities",
    talkToAdvisor: "Speak with an advisor",
    back: "Back to the catalogue",
    validatedByTeam: "Validated by our team",
    dossierOf: "{title} dossier",
    facts: {
      assetType: "Asset type",
      location: "Location",
      investmentRange: "Investment range",
      horizon: "Horizon",
    },
    ctaTitle: "Interested in this opportunity?",
    ctaBody:
      "Talk to us about this asset. We'll walk you through the details and answer your questions, with no obligation.",
    ctaButton: "Ask about this opportunity",
  },

  contact: {
    metaTitle: "Contact",
    metaDescription:
      "Contact a B&G Consulting investment advisor directly. A direct line for investors looking for personal guidance.",
    eyebrow: "Speak to a person",
    title: "Speak directly with an advisor",
    intro:
      "If you prefer direct contact, leave your details and an advisor will review your request personally. For immediate guidance, our assistant is always available.",
    form: {
      name: "Name",
      namePlaceholder: "Your full name",
      email: "Email",
      emailPlaceholder: "you@email.com",
      context: "Message",
      contextPlaceholder: "Tell us briefly what kind of investment interests you and your timeframe.",
      submit: "Request contact",
      submitting: "Sending…",
      consent:
        "By submitting this form you agree that an advisor may contact you. We never share your details with third parties.",
      genericError: "We couldn't send your request. Please try again.",
      successTitle: "Thank you for your interest",
      successBody:
        "We've received your request. An advisor will review your message and get in touch with you personally. In the meantime, feel free to explore our opportunities.",
      viewOpportunities: "View opportunities",
      talkToAdvisor: "Speak with an advisor",
    },
  },

  guides: {
    metaTitle: "International real estate investment guides | Europe, LatAm and Dubai",
    metaDescription:
      "Practical, verifiable guides to real estate investment in Europe, Latin America and Dubai: locations, tax, market comparisons and frequently asked questions.",
    keywords:
      "real estate investment guides, international property investment, Marbella guide, Dubai guide, property market comparison",
    eyebrow: "Insights",
    title: "International real estate investment guides",
    intro:
      "Practical, verifiable analysis to invest wisely in Europe, Latin America and Dubai. No promised returns. No shortcuts. Just useful information to make better decisions.",
    all: "All",
    searchLabel: "Search guides",
    searchPlaceholder: "Search guides...",
    featured: "Featured",
    readingTime: "{time} read",
    readGuide: "Read guide →",
    noResults: "No guides match your search. Try another term or filter.",
    backToAll: "← All guides",
    updated: "Updated {date}",
    faqTitle: "Frequently asked questions",
    disclaimer:
      "This content is for information only and does not constitute financial, tax or legal advice. Every transaction should be assessed individually with professional advice.",
    ctaTitle: "Want to explore real opportunities with this approach?",
    ctaBody: "Talk to an advisor to see which validated assets fit your profile and investment goals.",
    ctaButton: "Speak with an advisor",
    notFound: "Guide not found",
    categories: {
      "zone-guide": "Location guide",
      "market-comparison": "Market comparison",
      analysis: "Analysis",
      faq: "FAQ",
    },
    regions: {
      europe: "Europe",
      latam: "Latin America",
      dubai: "Dubai",
      international: "International",
    },
  },

  assistantPage: {
    metaTitle: "Brigitte, your investment assistant",
    metaDescription:
      "Chat with Brigitte, B&G Consulting's virtual assistant, to find the opportunity that fits your profile. Whenever you like, we'll put you in touch with our team.",
    back: "Back",
  },

  brigitte: {
    name: "Brigitte",
    role: "Virtual assistant · B&G Consulting",
    launcher: "Chat with Brigitte",
    open: "Open chat with Brigitte",
    close: "Close chat",
    greeting:
      "Hi, I'm Brigitte, B&G Consulting's virtual assistant. I can help you find opportunities that suit you and, whenever you like, put you in touch with someone from our team. What brings you here today?",
    propertyGreeting: "I see you're looking at “{title}”. What would you like to know?",
    placeholder: "Write your message…",
    send: "Send",
    typing: "Brigitte is typing",
    talkToPerson: "Speak to a person",
    handoffIntro:
      "Of course. Just leave your name and how you'd like us to reach you, and someone from our team will write to you personally, with our whole conversation in front of them.",
    namePlaceholder: "Your name",
    emailPlaceholder: "Your email",
    phonePlaceholder: "Phone or WhatsApp (optional)",
    handoffSubmit: "Send",
    handoffSending: "Sending…",
    handoffRequired: "I just need your name and email so we can get back to you.",
    handoffThanks:
      "Thank you, {name}. I've passed this on to our team and they'll write to you at {email} very soon. In the meantime, I'm still here if you'd like to ask anything else.",
    handoffError: "I couldn't send that. Shall we try again?",
    genericError:
      "Sorry, I'm having a technical issue right now. If you like, leave your details and someone from the team will write to you directly.",
    disclaimer: "Brigitte is an AI assistant. She can make mistakes: our team confirms every detail.",
  },

  notFound: {
    title: "Page not found",
    body: "The page you're looking for doesn't exist or has moved.",
    home: "Back to home",
  },
}
