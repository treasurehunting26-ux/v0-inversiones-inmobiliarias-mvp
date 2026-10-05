import type { Guide } from "./types"
import { guideSlugs } from "./slugs"

/** Guides in English. Same `id` as the Spanish versions, own slug. */
export const guidesEn: Guide[] = [
  {
    id: "marbella",
    slug: guideSlugs["marbella"].en,
    category: "zone-guide",
    region: "europe",
    image: "/guias/marbella-costa-del-sol.png",
    title: "How to invest in property in Marbella and the Costa del Sol",
    metaTitle: "Investing in Marbella property: a 2026 guide for investors",
    metaDescription:
      "A practical guide to investing in property in Marbella and the Costa del Sol: asset types, demand drivers, the tax framework and key considerations for international investors.",
    keywords: [
      "invest in marbella",
      "costa del sol property investment",
      "buy property marbella",
      "marbella real estate",
      "luxury property spain",
    ],
    excerpt:
      "What to consider before investing on the Costa del Sol: international demand, asset types, seasonality and the tax framework for non-residents.",
    readingTime: "8 min",
    updated: "January 2026",
    dateModified: "2026-01-15",
    sections: [
      {
        heading: "Why the Costa del Sol attracts international capital",
        paragraphs: [
          "The Costa del Sol, and Marbella in particular, has established itself as one of southern Europe's most stable premium property markets. Its appeal combines climate, international connectivity through Málaga airport, mature infrastructure and an international community that has been settled there for decades.",
          "For investors, this translates into demand that is diversified by nationality and by motive: second homes, relocation, holiday lets and wealth diversification. That diversity reduces dependence on any single buyer segment.",
        ],
      },
      {
        heading: "The most common asset types",
        paragraphs: [
          "Not every asset plays the same role in a portfolio. It is worth being clear about the purpose of each investment before buying.",
        ],
        bullets: [
          "Detached villas: higher entry ticket and running costs, geared towards capital growth and personal use.",
          "Apartments in serviced developments: more liquid, with steadier rental demand.",
          "Off-plan new builds: allow entry at an early price, with a longer time horizon and construction risk.",
          "Repositioning assets: properties to refurbish, with growth potential once improved.",
        ],
      },
      {
        heading: "Tax framework for non-residents",
        paragraphs: [
          "Investing in Spain as a non-resident involves specific tax obligations that you should understand before completing a purchase. These include transfer tax (ITP) or VAT on new builds, non-resident income tax and, where applicable, wealth tax.",
          "The purchase structure (in your own name or through a company) has significant tax and inheritance implications. It is a decision to take with individual professional advice, as it depends on the investor's tax residence and goals.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need to be a resident of Spain to invest in Marbella?",
        answer:
          "No. Non-residents can buy property in Spain. You will, however, need to obtain an NIE (foreigner identification number) and meet the tax obligations that come with owning the property.",
      },
      {
        question: "What additional costs are there beyond the purchase price?",
        answer:
          "As a guide, transaction costs (taxes, notary, land registry and fees) usually fall within a percentage range of the price. The exact figure depends on the type of asset and whether it is a new build or a resale, so it should be calculated case by case.",
      },
    ],
  },
  {
    id: "dubai",
    slug: guideSlugs["dubai"].en,
    category: "zone-guide",
    region: "dubai",
    image: "/guias/dubai-inversion.png",
    title: "Investing in property in Dubai: a guide for international investors",
    metaTitle: "Investing in Dubai property: a 2026 guide for investors",
    metaDescription:
      "Key points for investing in Dubai's property market: freehold areas, the regulatory framework, tax and demand drivers for international investors.",
    keywords: [
      "invest in dubai",
      "dubai property investment",
      "buy property dubai",
      "dubai real estate",
      "freehold property dubai",
    ],
    excerpt:
      "Freehold areas, the role of RERA, tax and demand drivers in one of the world's most dynamic property markets.",
    readingTime: "7 min",
    updated: "January 2026",
    dateModified: "2026-01-15",
    sections: [
      {
        heading: "The concept of freehold ownership",
        paragraphs: [
          "Dubai allows foreigners to buy property outright (freehold) within designated areas. This was a structural change that opened the market to international capital and explains much of the development of the last two decades.",
          "For investors, it is essential to check that an asset is located in a freehold area before going further, as outside those areas the ownership regime may differ (leasehold or usufruct).",
        ],
      },
      {
        heading: "Regulatory framework: RERA and DLD",
        paragraphs: [
          "The market is regulated by the Dubai Land Department (DLD) and its regulatory agency, RERA. There are mechanisms such as escrow accounts for off-plan projects, designed to protect buyers.",
          "Understanding these mechanisms is part of due diligence. Regulation does not remove risk, but it does provide a verifiable framework of investor protection.",
        ],
      },
      {
        heading: "Tax and currency considerations",
        paragraphs: [
          "Dubai is known for a favourable tax framework for property, although there are transaction fees associated with registration. Investors should also consider currency effects, as the dirham is pegged to the US dollar.",
          "Your final tax position always depends on your tax residence in your home country. Individual advice is essential.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can foreigners buy property in Dubai?",
        answer:
          "Yes. Within areas designated as freehold, foreigners can own property outright. It is key to confirm an asset's freehold status before buying.",
      },
      {
        question: "What is an escrow account for off-plan projects?",
        answer:
          "It is a regulated account into which the buyer's payments are deposited, and from which the developer can only draw funds as construction progresses. It is a protection mechanism supervised by the regulator.",
      },
    ],
  },
  {
    id: "market-comparison",
    slug: guideSlugs["market-comparison"].en,
    category: "market-comparison",
    region: "international",
    image: "/guias/comparativa-mercados.png",
    title: "Europe, Latin America and Dubai: how to compare property markets",
    metaTitle: "Comparing property markets: Europe, LatAm and Dubai",
    metaDescription:
      "A framework for comparing international property markets: liquidity, legal framework, currency, tax and demand profile. How to assess each market before investing.",
    keywords: [
      "property market comparison",
      "international property investment",
      "real estate diversification",
      "international real estate markets",
    ],
    excerpt:
      "A set of objective criteria — liquidity, legal framework, currency and demand — to compare markets before committing capital.",
    readingTime: "9 min",
    updated: "January 2026",
    dateModified: "2026-01-15",
    sections: [
      {
        heading: "There is no best market, only the right one for each goal",
        paragraphs: [
          "Comparing property markets isn't about finding the one with the highest theoretical return, but the one that best fits the investor's goal: capital preservation, income, capital growth or geographical diversification.",
          "Each market has its own risk profile and structural characteristics. A useful comparison is made on consistent criteria, not on headlines.",
        ],
      },
      {
        heading: "Objective comparison criteria",
        paragraphs: ["These are the dimensions that allow a rigorous comparison between jurisdictions:"],
        bullets: [
          "Liquidity: how easily, and how quickly on average, the asset can be sold.",
          "Legal framework: legal certainty of ownership and protection for foreign buyers.",
          "Currency: exposure to exchange rates against the investor's own currency.",
          "Tax: taxes on purchase, ownership and transfer.",
          "Demand profile: diversity of buyers and dependence on a single segment.",
        ],
      },
      {
        heading: "Geographical diversification as a strategy",
        paragraphs: [
          "Spreading capital across markets with different economic cycles and currencies can reduce exposure to any single risk factor. It is not a guarantee of better results, but a way of managing concentration.",
          "Diversification adds operational and tax complexity, so it makes sense when the size of the investment justifies it.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is it better to concentrate on one market or to diversify?",
        answer:
          "It depends on the investor's volume, goals and risk tolerance. Concentration simplifies management; diversification reduces exposure to a single market or currency but adds complexity. There is no single answer.",
      },
      {
        question: "Which criterion matters most when comparing markets?",
        answer:
          "There is no universal criterion. For an investor focused on preserving capital, the legal framework and liquidity usually matter most; for those seeking income, the demand profile and the taxation of rental income. The goal defines the dominant criterion.",
      },
    ],
  },
  {
    id: "faq",
    slug: guideSlugs["faq"].en,
    category: "faq",
    region: "international",
    image: "/guias/preguntas-frecuentes.png",
    title: "Frequently asked questions about international property investment",
    metaTitle: "International property investment: frequently asked questions",
    metaDescription:
      "Answers to the most common questions about international property investment: due diligence, tax, currency, liquidity and how opportunities are selected.",
    keywords: [
      "property investment questions",
      "investing in property abroad",
      "real estate investment faq",
      "how to invest in property",
    ],
    excerpt: "Clear answers, with no promises, to the most common questions from international property investors.",
    readingTime: "6 min",
    updated: "January 2026",
    dateModified: "2026-01-15",
    sections: [
      {
        heading: "About the investment process",
        paragraphs: [
          "Investing in property outside your country of residence means understanding different legal, tax and operational processes. These questions cover the doubts investors most often raise before taking the step.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is due diligence in a property transaction?",
        answer:
          "It is the verification process before purchase: the property's land-registry status, charges, licences, planning status and legal standing. Its purpose is to confirm that the asset is what it appears to be and that the transaction is safe.",
      },
      {
        question: "Can I invest without travelling to the country where the property is?",
        answer:
          "In many cases, yes, through a notarised power of attorney and legal representation. Whether to do so remotely depends on your level of trust in the intermediaries and on the due diligence carried out.",
      },
      {
        question: "Does a well-located property guarantee a return?",
        answer:
          "No. Location matters, but no property investment guarantees a return. Value can rise or fall with the market cycle, currency and local factors. Any claim of a guaranteed return should be treated with scepticism.",
      },
      {
        question: "How are the opportunities you present selected?",
        answer:
          "Each opportunity is analysed and validated individually before it is presented, looking at its legal status, location and fit with the investor's profile. No asset is published without passing that review.",
      },
    ],
  },
]
