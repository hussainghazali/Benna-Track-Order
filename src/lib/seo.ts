import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { allCityNames } from "@/data/saudiCities";

const SITE_NAME = "Benna";
const SITE_NAME_AR = "بناء";
const SITE_URL = "https://store.benna.com.sa";
const SITE_LOGO =
  "https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png";
const DEFAULT_OG_IMAGE = "https://store.benna.com.sa/og-image.jpg";

export interface SeoConfig {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  canonical?: string;
  ogType?: "website" | "product" | "article" | "profile";
  ogImage?: string;
  noindex?: boolean;
  schemas?: Record<string, unknown>[];
  keywords?: string;
  keywordsAr?: string;
}

// ─── Organization Schema ───
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Benna",
    alternateName: [
      "بناء",
      "Benna KSA",
      "Benna Building Materials",
      "بناء للمواد",
      "منصة بناء",
      "Benna Marketplace",
    ],
    url: SITE_URL,
    logo: SITE_LOGO,
    description:
      "Saudi Arabia's #1 building materials marketplace and construction ecommerce platform. 184,267+ products across 1,085 categories from 95 verified vendors. AI BOQ, RFQ, vendor chat, KSA-wide delivery.",
    foundingCountry: "SA",
    areaServed: { "@type": "Country", name: "Saudi Arabia" },
    sameAs: [
      "https://twitter.com/BennaKSA",
      "https://www.instagram.com/bennaksa",
      "https://www.linkedin.com/company/bennaksa",
    ],
    telephone: ["+10000000000", "+10000000001", "+10000000002"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+10000000000",
        contactType: "customer service",
        areaServed: "SA",
        availableLanguage: ["Arabic", "English"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+10000000001",
        contactType: "sales",
        areaServed: "SA",
        availableLanguage: ["Arabic", "English"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+10000000002",
        contactType: "technical support",
        areaServed: "SA",
        availableLanguage: ["Arabic", "English"],
      },
    ],
  };
}

// ─── WebSite Schema with SearchAction ───
export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_NAME_AR,
    url: SITE_URL,
    inLanguage: ["ar", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop/search-products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── OnlineStore Schema (NEW) ───
export function getOnlineStoreSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "Benna - بناء",
    url: SITE_URL,
    logo: SITE_LOGO,
    description:
      "Saudi Arabia's #1 online building materials marketplace and construction ecommerce platform. 184,267+ products from 95 verified vendors across 1,085 categories — cement, steel, tiles, paints, tools, plumbing, electrical, sanitary, and equipment. KSA-wide delivery, RFQ, AI BOQ, vendor chat.",
    paymentAccepted:
      "Apple Pay, Mada, Visa, Mastercard, SADAD, PayTabs, STC Pay, Cash on Delivery, Bank Transfer",
    currenciesAccepted: "SAR",
    areaServed: {
      "@type": "Country",
      name: "Saudi Arabia",
    },
    availableLanguage: ["Arabic", "English"],
    returnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "SA",
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
  };
}

// ─── LocalBusiness / Store Schema ───
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Benna - بناء",
    image: SITE_LOGO,
    url: SITE_URL,
    description:
      "Saudi Arabia's leading online marketplace for building materials and construction supplies. Shop cement, steel, tiles, paints, tools, and more.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "SA",
      addressRegion: "Riyadh",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 24.7136,
      longitude: 46.6753,
    },
    areaServed: [
      { "@type": "Country", name: "Saudi Arabia" },
      ...allCityNames.map((city) => ({ "@type": "City", name: city })),
    ],
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    currenciesAccepted: "SAR",
    paymentAccepted:
      "Apple Pay, Mada, Visa, Mastercard, SADAD, PayTabs, STC Pay, Cash, Bank Transfer",
  };
}

// ─── BreadcrumbList Schema ───
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

// ─── Product Schema (Enhanced with rich snippets) ───
export function getProductSchema(product: {
  name: string;
  description?: string;
  image: string;
  price: number;
  originalPrice?: number;
  brand: string;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  slug: string;
  priceValidUntil?: string;
  deliveryDays?: number;
  reviews?: { author: string; rating: number; content: string; date: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: product.image,
    sku: product.sku || product.slug,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "SAR",
      price: product.price,
      priceValidUntil:
        product.priceValidUntil ||
        new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      availability: `https://schema.org/${product.availability || "InStock"}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Benna" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "SA",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: product.deliveryDays || 7,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "SA",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
      },
    },
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: product.reviewCount || 1,
          },
        }
      : {}),
    ...(product.reviews && product.reviews.length > 0
      ? {
          review: product.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
            },
            reviewBody: r.content,
            datePublished: r.date,
          })),
        }
      : {}),
  };
}

// ─── FAQPage Schema ───
export function getFAQPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ─── CollectionPage / ItemList Schema ───
export function getItemListSchema(
  name: string,
  items: { name: string; url: string; image?: string; position: number }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 20).map((item) => ({
        "@type": "ListItem",
        position: item.position,
        name: item.name,
        url: `${SITE_URL}${item.url}`,
        ...(item.image ? { image: item.image } : {}),
      })),
    },
  };
}

// ─── Speakable Schema (AIO/AEO) ───
export function getSpeakableSchema(
  url: string,
  cssSelectors: string[] = ["h1", "[data-speakable]", "main p:first-of-type"],
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `${SITE_URL}${url}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

// ─── ServiceArea Schema for Products (GEO) ───
export function getProductServiceAreaSchema(
  productName: string,
  productUrl: string,
) {
  // Use the complete list of all Saudi cities and towns
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Product Delivery",
    provider: { "@type": "Organization", name: "Benna", url: SITE_URL },
    areaServed: allCityNames.map((city) => ({ "@type": "City", name: city })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: productName,
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: productName,
            url: `${SITE_URL}${productUrl}`,
          },
        },
      ],
    },
  };
}

// ─── HowTo Schema for Construction Categories (AEO) ───
export function getHowToSchema(howTo: {
  name: string;
  nameAr: string;
  description: string;
  steps: { name: string; text: string; image?: string }[];
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howTo.name,
    description: howTo.description,
    totalTime: howTo.totalTime || "PT30M",
    tool: [{ "@type": "HowToTool", name: "Building Materials from Benna" }],
    step: howTo.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
      ...(step.image ? { image: step.image } : {}),
    })),
  };
}

// ─── Service Schema for RFQ/RFP/BOQ ───
export function getRFQServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Request for Quotation (RFQ) - Building Materials",
    alternateName: ["طلب عرض سعر", "RFQ", "Request for Proposal", "RFP"],
    description:
      "Submit bulk building material requirements and receive competitive quotes from 95 verified Saudi suppliers. Free to use. Covers cement, steel, tiles, plumbing, electrical, and all construction categories.",
    provider: {
      "@type": "Organization",
      name: "Benna",
      url: SITE_URL,
    },
    serviceType: "Procurement",
    areaServed: { "@type": "Country", name: "Saudi Arabia" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Building Materials Categories",
      itemListElement: [
        { "@type": "OfferCatalog", name: "Cement & Concrete" },
        { "@type": "OfferCatalog", name: "Steel & Reinforcement" },
        { "@type": "OfferCatalog", name: "Tiles & Flooring" },
        { "@type": "OfferCatalog", name: "Plumbing Supplies" },
        { "@type": "OfferCatalog", name: "Electrical Supplies" },
        { "@type": "OfferCatalog", name: "Paints & Coatings" },
        { "@type": "OfferCatalog", name: "Tools & Equipment" },
      ],
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SAR",
      description: "Free to submit RFQ requests",
    },
  };
}

export function getBOQServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "AI Bill of Quantities (BOQ) Generator",
    alternateName: ["حاسبة كميات البناء", "BOQ Generator", "Build My Project"],
    description:
      "AI-powered Bill of Quantities generator for construction projects in Saudi Arabia. Get instant material estimates for villas, apartments, commercial buildings, warehouses, and renovations.",
    provider: {
      "@type": "Organization",
      name: "Benna",
      url: SITE_URL,
    },
    serviceType: "Construction Planning",
    areaServed: { "@type": "Country", name: "Saudi Arabia" },
  };
}

// ─── Construction OS WebApplication Schema (positions Benna as a platform, not just a store) ───
export function getConstructionOSSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Benna Construction OS",
    alternateName: ["نظام البناء بنّا", "Benna Procurement Engine"],
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    url: SITE_URL,
    description:
      "Saudi Arabia's AI-powered construction operating system. AI BOQ generation, managed RFQs, verified vendor marketplace, and KSA-wide logistics for contractors, vendors, and builders aligned with Vision 2030.",
    featureList: [
      "AI Bill of Quantities (BOQ) generator",
      "Request for Quotation (RFQ) marketplace",
      "Verified vendor directory (95 suppliers)",
      "184,267+ building material SKUs",
      "Vendor chat and negotiation",
      "Delivery to KSA, GCC, and worldwide",
      "Bilingual Arabic/English",
      "Bulk and contractor pricing",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "2147",
      bestRating: "5",
    },
    audience: [
      { "@type": "Audience", audienceType: "Contractors" },
      { "@type": "Audience", audienceType: "Vendors / Suppliers" },
      { "@type": "Audience", audienceType: "Individual Builders" },
      { "@type": "Audience", audienceType: "Government Projects" },
    ],
  };
}

// ─── MobileApplication Schemas (Android & iOS PWA) ───
export function getMobileAppSchemas() {
  const base = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "Benna — Construction Marketplace",
    applicationCategory: "ShoppingApplication",
    description:
      "Shop 184,267+ building materials, submit RFQs, generate AI BOQs, and chat with vendors across Saudi Arabia.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "2147",
      bestRating: "5",
    },
    publisher: { "@type": "Organization", name: "Benna", url: SITE_URL },
  };
  return [
    { ...base, operatingSystem: "ANDROID", url: SITE_URL },
    { ...base, operatingSystem: "iOS", url: SITE_URL },
  ];
}

export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Benna AI Construction OS",
    alternateName: ["بناء", "Benna AI BOQ", "Benna RFQ Platform"],
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    url: SITE_URL,
    description:
      "AI-powered construction commerce software for Saudi Arabia: marketplace, RFQ/RFP, AI BOQ generation, vendor chat, secure payments, and KSA-wide delivery.",
    featureList: [
      "AI construction recommendations",
      "Bill of Quantities generation",
      "RFQ and RFP submission",
      "Real-time vendor chat",
      "Android and iOS PWA install",
      "Arabic and English marketplace experience",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
    publisher: { "@type": "Organization", name: "Benna", url: SITE_URL },
  };
}

export function getHomepageVideoObjectSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Benna Construction OS for Saudi Arabia",
    description:
      "Overview of Benna's AI-powered construction marketplace, RFQ/RFP tools, BOQ generation, vendor chat, and building material delivery across KSA, GCC, and worldwide.",
    thumbnailUrl: [DEFAULT_OG_IMAGE],
    uploadDate: "2026-01-01",
    contentUrl:
      "https://video.wixstatic.com/video/b99a57_3db878ca38f84f1ea3f59b18bcac5c61/1080p/mp4/file.mp4",
    embedUrl: `${SITE_URL}/`,
    publisher: {
      "@type": "Organization",
      name: "Benna",
      logo: { "@type": "ImageObject", url: SITE_LOGO },
    },
  };
}

// ─── Dataset Schema (KSA construction material price index — primary source for AI citations) ───
export function getPriceDatasetSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Saudi Arabia Building Materials Price Index",
    alternateName: "مؤشر أسعار مواد البناء في المملكة العربية السعودية",
    description:
      "Live price dataset for 184,267+ building material SKUs across Saudi Arabia, updated continuously by 95 verified vendors. Covers cement, steel, tiles, plumbing, electrical, paints, tools, and more across 165+ cities.",
    url: `${SITE_URL}/products`,
    keywords: [
      "Saudi Arabia cement price",
      "KSA steel rebar price",
      "Riyadh building materials price",
      "Jeddah construction supplies",
      "Dammam material costs",
      "أسعار مواد البناء السعودية",
    ],
    creator: { "@type": "Organization", name: "Benna", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Benna", url: SITE_URL },
    spatialCoverage: { "@type": "Country", name: "Saudi Arabia" },
    temporalCoverage: "2023-01-01/..",
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "text/html",
        contentUrl: `${SITE_URL}/products`,
      },
    ],
  };
}

// ─── Vendor / Supplier Schema ───
export function getVendorSchema(vendor: {
  name: string;
  url: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  logo?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@additionalType": "https://schema.org/Supplier",
    name: vendor.name,
    url: `${SITE_URL}${vendor.url}`,
    description:
      vendor.description ||
      `${vendor.name} - Verified building materials supplier on Benna, Saudi Arabia.`,
    ...(vendor.logo ? { logo: vendor.logo } : {}),
    ...(vendor.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: vendor.rating,
            bestRating: 5,
            reviewCount: vendor.reviewCount || 1,
          },
        }
      : {}),
    areaServed: { "@type": "Country", name: "Saudi Arabia" },
    memberOf: {
      "@type": "Organization",
      name: "Benna Marketplace",
      url: SITE_URL,
    },
  };
}

// ─── Article Schema (for AI answer pages) ───
export function getArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}${article.url}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image || DEFAULT_OG_IMAGE,
    author: { "@type": "Organization", name: "Benna" },
    publisher: {
      "@type": "Organization",
      name: "Benna",
      logo: { "@type": "ImageObject", url: SITE_LOGO },
    },
    inLanguage: ["en", "ar"],
    isAccessibleForFree: true,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${article.url}`,
    },
  };
}

// ─── City Landing Page Schema ───
export function getCityLandingSchema(city: {
  name: string;
  nameAr: string;
  slug: string;
  lat: number;
  lng: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: `Benna - Building Materials in ${city.name}`,
    alternateName: `بناء - مواد بناء في ${city.nameAr}`,
    url: `${SITE_URL}/building-materials-${city.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressCountry: "SA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.lat,
      longitude: city.lng,
    },
    areaServed: { "@type": "City", name: city.name },
    priceRange: "$$",
    currenciesAccepted: "SAR",
  };
}

// ═══════════════════════════════════════════
// useSeo Hook
// ═══════════════════════════════════════════
export function useSeo(config: SeoConfig) {
  const location = useLocation();
  const fullUrl = config.canonical || `${SITE_URL}${location.pathname}`;

  useEffect(() => {
    // Single source of truth for titles: only append "| Benna" if the
    // config title doesn't already include it. Prevents "Benna | Benna | Benna".
    const rawTitle = config.title.trim();
    const finalTitle = /\bBenna\b/i.test(rawTitle)
      ? rawTitle
      : `${rawTitle} | ${SITE_NAME}`;
    document.title = finalTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(
        `meta[${attr}="${key}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", config.description);
    if (config.keywords) setMeta("name", "keywords", config.keywords);

    setMeta(
      "name",
      "robots",
      config.noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );

    // GEO targeting
    setMeta("name", "geo.region", "SA");
    setMeta("name", "geo.placename", "Saudi Arabia");
    setMeta("name", "geo.position", "24.7136;46.6753");
    setMeta("name", "ICBM", "24.7136, 46.6753");
    setMeta("name", "language", "Arabic, English");
    setMeta("name", "audience", "Saudi Arabia, GCC, Middle East");

    // Open Graph - use finalTitle (deduped) so social previews don't repeat "Benna"
    setMeta("property", "og:title", finalTitle);
    setMeta("property", "og:description", config.description);
    setMeta("property", "og:type", config.ogType || "website");
    setMeta("property", "og:url", fullUrl);
    setMeta("property", "og:image", config.ogImage || DEFAULT_OG_IMAGE);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "ar_SA");
    setMeta("property", "og:locale:alternate", "en_US");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:site", "@BennaKSA");
    setMeta("name", "twitter:title", finalTitle);
    setMeta("name", "twitter:description", config.description);
    setMeta("name", "twitter:image", config.ogImage || DEFAULT_OG_IMAGE);

    // Canonical
    let canonicalEl = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", fullUrl);

    // Hreflang
    const setHreflang = (lang: string, href: string) => {
      let el = document.querySelector(
        `link[rel="alternate"][hreflang="${lang}"]`,
      ) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "alternate");
        el.setAttribute("hreflang", lang);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };
    // Add lang query param to differentiate ar/en for hreflang (KSA-targeted)
    const baseUrl = fullUrl.split("?")[0];
    setHreflang("ar-SA", `${baseUrl}?lang=ar`);
    setHreflang("ar", `${baseUrl}?lang=ar`);
    setHreflang("en-SA", `${baseUrl}?lang=en`);
    setHreflang("en", `${baseUrl}?lang=en`);
    setHreflang("x-default", baseUrl);

    // JSON-LD Schemas
    document
      .querySelectorAll('script[data-seo-schema="true"]')
      .forEach((el) => el.remove());

    const allSchemas = [
      getOrganizationSchema(),
      getWebsiteSchema(),
      getOnlineStoreSchema(),
      ...(config.schemas || []),
    ];

    allSchemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-schema", "true");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document
        .querySelectorAll('script[data-seo-schema="true"]')
        .forEach((el) => el.remove());
    };
  }, [config.title, config.description, fullUrl]);
}

// ═══════════════════════════════════════════
// Pre-built Page SEO Configs
// ═══════════════════════════════════════════
export const PAGE_SEO: Record<string, SeoConfig> = {
  home: {
    title: "Building Materials Marketplace in Saudi Arabia",
    titleAr: "منصة مواد البناء في السعودية",
    description:
      "Shop 184,267+ building materials from 95 verified Saudi vendors across 1,085 categories. AI BOQ, RFQ, vendor chat, KSA-wide delivery.",
    descriptionAr:
      "تسوق أكثر من 184,267+ منتج بناء من 95 مورد معتمد. جداول كميات بالذكاء الاصطناعي، عروض أسعار، وتوصيل لكل مدن المملكة.",
    keywords:
      "building materials marketplace Saudi Arabia, #1 construction ecommerce KSA, best building materials platform Saudi, online cement Saudi, online steel KSA, AI BOQ generator Saudi, RFQ Saudi suppliers, construction OS, vendor chat, building materials Riyadh, building materials Jeddah, building materials Dammam, مواد بناء, متجر مواد بناء, أفضل منصة مواد بناء, منصة بناء, أسمنت, حديد, بلاط, دهانات, أدوات, RFQ, BOQ",
    schemas: [
      getLocalBusinessSchema(),
      getConstructionOSSchema(),
      getSoftwareApplicationSchema(),
      ...getMobileAppSchemas(),
      getPriceDatasetSchema(),
      getRFQServiceSchema(),
      getBOQServiceSchema(),
      getHowToSchema({
        name: "How to buy building materials online in Saudi Arabia with Benna",
        nameAr: "كيفية شراء مواد البناء أونلاين في السعودية عبر بنّا",
        description:
          "A step-by-step guide for contractors and builders to compare materials, submit RFQs, generate AI BOQs, pay securely, and receive delivery through Benna.",
        totalTime: "PT10M",
        steps: [
          {
            name: "Search products",
            text: "Search for cement, steel, tiles, electrical, plumbing, sanitary ware, tools, or any building material category on Benna.",
          },
          {
            name: "Compare vendors",
            text: "Compare verified Saudi vendors, prices, availability, reviews, and delivery options near your city.",
          },
          {
            name: "Use AI BOQ or RFQ",
            text: "Generate a Bill of Quantities with AI or submit an RFQ/RFP for bulk contractor pricing.",
          },
          {
            name: "Pay and receive",
            text: "Pay securely with Apple Pay, Mada, Visa, Mastercard, or SADAD and receive delivery to your construction site.",
          },
        ],
      }),
      getFAQPageSchema([
        {
          question:
            "What is the #1 building materials marketplace in Saudi Arabia?",
          answer:
            "Benna is the #1 building materials marketplace and construction ecommerce platform in Saudi Arabia, with 184,267+ products across 1,085 categories from 95 verified Saudi vendors, plus AI BOQ, RFQ, vendor chat, and KSA-wide delivery.",
        },
        {
          question: "What is Benna?",
          answer:
            "Benna is Saudi Arabia's leading AI-powered construction commerce ecosystem — a building materials marketplace, RFQ/RFP platform, AI BOQ generator, vendor chat, secure payments, and KSA-wide logistics in one place.",
        },
        {
          question:
            "Can I buy cement, steel, tiles, electrical, plumbing, and sanitary materials online in Saudi Arabia?",
          answer:
            "Yes. Benna lets contractors, builders, and consumers buy cement, steel, tiles, paints, electrical, plumbing, sanitary ware, tools, and contractor supplies online with delivery across KSA, GCC, and worldwide.",
        },
        {
          question: "Which payment methods does Benna accept?",
          answer:
            "Benna accepts Apple Pay, Mada, Visa, Mastercard, SADAD, PayTabs, STC Pay, bank transfer, and cash on delivery — all in Saudi Riyal (SAR).",
        },
        {
          question: "Does Benna deliver to all Saudi cities?",
          answer:
            "Yes. Benna delivers building materials to 165+ Saudi cities including Riyadh, Jeddah, Makkah, Madinah, Dammam, Khobar, Jubail, Taif, Yanbu, Abha, Tabuk, Hail, and more.",
        },
        {
          question: "Is Benna free for contractors and vendors?",
          answer:
            "Yes. Browsing the marketplace, submitting RFQs, generating AI BOQs, and vendor onboarding are all free on Benna.",
        },
        {
          question: "Is Benna available as an Android and iOS app?",
          answer:
            "Yes. Benna is available on the Apple App Store and Google Play, plus a PWA install on any device, with marketplace browsing, RFQ alerts, vendor chat, AI BOQ tools, and repeat ordering.",
        },
      ]),
      getHomepageVideoObjectSchema(),
    ],
  },
  categories: {
    title: "All Building Material Categories",
    description:
      "Browse all building material categories — cement, steel, plumbing, electrical, tiles, wood, paints, and more across Saudi Arabia.",
    keywords:
      "building material categories, construction categories, cement, steel, plumbing, electrical, tiles, wood, paints, Saudi Arabia",
  },
  products: {
    title: "All Building Materials & Products",
    description:
      "Browse thousands of building materials and construction products from verified Saudi vendors. Compare prices, read reviews, and order online.",
    keywords:
      "building products, construction materials, Saudi vendors, online building store, مواد بناء, منتجات إنشاء",
  },
  deals: {
    title: "Deals & Discounts on Building Materials",
    description:
      "Save big on building materials and construction supplies. Exclusive deals, flash sales, and bulk discounts on cement, steel, tiles, tools, and more in KSA.",
    keywords:
      "building material deals, construction discounts, KSA offers, bulk pricing, عروض مواد بناء",
  },
  sell: {
    title: "Sell Building Materials on Benna",
    description:
      "Join Saudi Arabia's largest B2B marketplace for building materials. Reach thousands of contractors, builders, and businesses. Start selling today.",
    keywords:
      "sell building materials, vendor marketplace, B2B construction, Saudi supplier, بيع مواد بناء",
  },
  about: {
    title: "About Benna",
    description:
      "Saudi Arabia's leading marketplace connecting verified building material suppliers with contractors and builders across the Kingdom.",
    keywords:
      "about Benna, building materials platform, Saudi construction marketplace, عن بناء",
  },
  contact: {
    title: "Contact Benna - Customer Support",
    description:
      "Get in touch with Benna's customer support team. We're here to help with orders, vendor inquiries, and any questions about building materials in Saudi Arabia.",
    keywords:
      "contact Benna, customer support, building materials help, تواصل معنا",
  },
  faqs: {
    title: "Frequently Asked Questions - Building Materials KSA",
    description:
      "Find answers to common questions about ordering building materials, shipping across Saudi Arabia, returns, payments, and more on Benna.",
    keywords:
      "FAQ building materials, construction supplies help, shipping KSA, returns policy, أسئلة شائعة, مواد بناء",
  },
  brands: {
    title: "Top Building Material Brands in Saudi Arabia",
    description:
      "Discover top building material brands available on Benna. Shop trusted brands for cement, tiles, paints, tools, and construction equipment in KSA.",
    keywords:
      "building material brands, construction brands Saudi, top brands KSA, علامات تجارية مواد بناء",
  },
  rfq: {
    title: "RFQ - Bulk Building Materials KSA",
    description:
      "Submit a Request for Quotation for bulk building materials. Get competitive pricing from verified Saudi suppliers for your construction projects.",
    keywords:
      "RFQ building materials, bulk order construction, quotation request, Saudi supplier pricing, طلب عرض سعر",
    schemas: [getRFQServiceSchema()],
  },
  supply: {
    title: "Benna Supply - Wholesale Building Materials",
    description:
      "Benna Supply offers wholesale building materials and construction supplies at competitive prices. Ideal for large projects and contractors in Saudi Arabia.",
    keywords:
      "wholesale building materials, bulk construction supplies, contractor pricing, Saudi wholesale",
  },
  fulfillment: {
    title: "Benna Fulfillment - Storage & Delivery Services",
    description:
      "Let Benna handle storage, packaging, and delivery of your building materials. Reliable fulfillment services across KSA, GCC, and worldwide.",
    keywords:
      "fulfillment services, building material delivery, warehousing KSA, construction logistics",
  },
  advertise: {
    title: "Advertise on Benna - Reach Builders & Contractors",
    description:
      "Promote your building materials and construction products to thousands of buyers across Saudi Arabia. Sponsored listings, banner ads, and featured placements.",
    keywords:
      "advertise building materials, construction ads, Saudi B2B advertising, sponsored products",
  },
  bennaPro: {
    title: "Benna Pro - Premium Membership for Builders",
    description:
      "Unlock exclusive benefits with Benna Pro. Get priority support, special pricing, early access to deals, and more for your construction business.",
    keywords:
      "Benna Pro, premium membership, builder benefits, contractor membership, عضوية بناء برو",
  },
  certificates: {
    title: "Benna Certificates & Accreditations",
    description:
      "View Benna's official certificates and accreditations. We maintain the highest standards of quality and compliance in the Saudi building materials market.",
    keywords:
      "Benna certificates, accreditations, quality standards, Saudi compliance, شهادات بناء",
  },
  topVendors: {
    title: "Top Building Material Vendors in Saudi Arabia",
    description:
      "Discover the highest-rated building material vendors on Benna. Verified Saudi suppliers with quality products, competitive prices, and KSA-wide delivery.",
    keywords:
      "top vendors, best suppliers, Saudi building material sellers, verified vendors, أفضل الموردين",
  },
  termsOfUse: {
    title: "Terms of Use",
    description:
      "Read Benna's terms of use governing your access to Saudi Arabia's leading building materials marketplace.",
    keywords:
      "terms of use, Benna terms, building materials terms, شروط الاستخدام",
  },
  termsOfSale: {
    title: "Terms of Sale",
    description:
      "Benna's terms of sale covering purchases, returns, and refunds for building materials ordered through our platform.",
    keywords: "terms of sale, purchase terms, return policy, شروط البيع",
  },
  privacyPolicy: {
    title: "Privacy Policy",
    description:
      "Learn how Benna protects your personal data. Our privacy policy outlines data collection, usage, and security practices.",
    keywords: "privacy policy, data protection, Benna privacy, سياسة الخصوصية",
  },
  warrantyPolicy: {
    title: "Warranty Policy",
    description:
      "Understand Benna's warranty policy for building materials and construction products purchased through our platform.",
    keywords:
      "warranty policy, building materials warranty, Benna warranty, سياسة الضمان",
  },
  competitorComparison: {
    title: "Benna vs BRKZ, YOUMATS, MADAR, MASDAR",
    titleAr: "بنّة مقابل المنافسين | نظام تجارة البناء",
    description:
      "Compare Benna with BRKZ, YOUMATS, MADAR, MASDAR. Saudi Arabia's first AI Construction Commerce OS — AI BOQ, RFQ, vendor chat, KSA-wide delivery.",
    descriptionAr:
      "قارن بنّة مع بركز ويوماتس ومدار ومصدر — أول نظام تشغيل لتجارة البناء بالذكاء الاصطناعي في السعودية مع جداول كميات وطلبات عروض ودردشة البائعين.",
    keywords:
      "BENNA vs BRKZ, construction marketplace Saudi Arabia, building materials comparison, AI construction platform, AI BOQ, RFQ Saudi Arabia, vendor chat, building materials Riyadh, building materials Jeddah, construction OS, best construction platform KSA, بنّة مقابل بركز، سوق البناء السعودية، مقارنة مواد البناء، منصة البناء بالذكاء الاصطناعي، جداول كميات بالذكاء الاصطناعي، طلبات العرض السعودية، دردشة البائعين، مواد البناء الرياض، مواد البناء جدة، نظام البناء، أفضل منصة البناء في السعودية",
    schemas: [
      getFAQPageSchema([
        {
          question:
            "Why is BENNA better than BRKZ, YOUMATS, MADAR, and MASDAR?",
          answer:
            "BENNA is Saudi Arabia's first AI-native Construction Commerce OS with 5 integrated layers: Commerce (Marketplace + RFQ + Orders), Intelligence (AI BOQ + Predictive Demand), Vendor SaaS (Full Dashboard OS), Engagement (Chat + Loyalty + Insights), and Geo + AI Discovery (GEO SEO + AEO). Competitors only solve one layer (supply connection).",
        },
        {
          question:
            "What makes BENNA different from other construction marketplaces?",
          answer:
            "BENNA is the only platform with AI BOQ generation, AI marketing engine, AI search visibility, vendor chat, multilingual dashboard, custom SEO engine, bulk upload, inventory management, promotions engine, customer segmentation, loyalty system, and predictive demand - all in one integrated platform.",
        },
        {
          question:
            "Does BENNA have better vendor tools than BRKZ and YOUMATS?",
          answer:
            "Yes. BENNA offers a full vendor SaaS dashboard with multilingual support, comprehensive analytics, custom SEO engine, bulk upload capabilities, inventory and order management, promotions engine, customer segmentation, and loyalty/referral system. BRKZ and YOUMATS have only basic or partial vendor tools.",
        },
        {
          question: "What AI features does BENNA have that competitors don't?",
          answer:
            "BENNA has AI BOQ tools, AI marketing engine, AI search visibility, AI customer queries, voice + AI search, and predictive demand. BRKZ, YOUMATS, MADAR, and MASDAR have no AI capabilities.",
        },
        {
          question: "Is BENNA available in Arabic and English?",
          answer:
            "Yes. BENNA is fully bilingual with Arabic and English support throughout the platform, including the marketplace, vendor dashboard, AI tools, and customer support. Most competitors have limited or no multilingual support.",
        },
      ]),
      getArticleSchema({
        title:
          "BENNA vs Competitors: Why Saudi Arabia's First AI Construction OS Wins",
        description:
          "Comprehensive comparison of BENNA with BRKZ, YOUMATS, MADAR, and MASDAR. Learn why BENNA's 5-layer AI-powered architecture makes it the superior choice for construction commerce in Saudi Arabia.",
        url: "/why-benna",
        datePublished: "2026-01-15",
      }),
      getSpeakableSchema("/why-benna", [
        "h1",
        "#dominance p",
        "#comparison h2",
        "#cta h2",
      ]),
    ],
  },
  login: {
    title: "Sign In to Your Account",
    description:
      "Sign in to your Benna account to manage orders, track deliveries, and shop building materials in Saudi Arabia.",
    noindex: true,
  },
  register: {
    title: "Create Your Benna Account",
    description:
      "Join Benna to access Saudi Arabia's largest online marketplace for building materials. Create your free account today.",
    noindex: true,
  },
  cart: {
    title: "Shopping Cart",
    description: "Review your building materials order before checkout.",
    noindex: true,
  },
  checkout: {
    title: "Checkout",
    description: "Complete your building materials purchase securely.",
    noindex: true,
  },
  search: {
    title: "Search Building Materials",
    description:
      "Search thousands of building materials and construction products. Find exactly what you need from verified Saudi suppliers.",
    keywords:
      "search building materials, find construction products, building supply search, بحث مواد بناء",
  },
};

// ─── Knowledge-graph entity schema (@graph: DefinedTerm + WebPage + Org) ───
export function getEntityKnowledgeSchema(entity: {
  slug: string;
  name: string;
  nameAr: string;
  kind: string;
  alternateNames: string[];
  definition: string;
  sameAs: string[];
  relatedSlugs: string[];
}) {
  const url = `${SITE_URL}/knowledge/${entity.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        "@id": `${url}#entity`,
        name: entity.name,
        alternateName: [entity.nameAr, ...entity.alternateNames],
        description: entity.definition,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          "@id": `${SITE_URL}/knowledge#termset`,
          name: "Benna Saudi Building Materials Knowledge Graph",
          url: `${SITE_URL}/knowledge`,
        },
        ...(entity.sameAs.length ? { sameAs: entity.sameAs } : {}),
        url,
      },
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: `${entity.name} — Benna knowledge graph`,
        inLanguage: ["ar", "en"],
        isPartOf: { "@id": `${SITE_URL}#website` },
        about: { "@id": `${url}#entity` },
        mentions: entity.relatedSlugs.map((s) => ({
          "@type": "DefinedTerm",
          "@id": `${SITE_URL}/knowledge/${s}#entity`,
          url: `${SITE_URL}/knowledge/${s}`,
        })),
        publisher: { "@id": `${SITE_URL}#organization` },
        provider: { "@id": `${SITE_URL}#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}#organization`,
        name: "Benna",
        alternateName: "بناء",
        url: SITE_URL,
        logo: SITE_LOGO,
        areaServed: { "@type": "Country", name: "Saudi Arabia" },
        knowsAbout: [entity.name, entity.nameAr, "Building materials", "مواد البناء"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: SITE_NAME_AR,
        inLanguage: ["ar", "en"],
        publisher: { "@id": `${SITE_URL}#organization` },
      },
    ],
  };
}

// ─── DefinedTermSet schema for the knowledge graph index ───
export function getKnowledgeIndexSchema(
  entities: { slug: string; name: string; nameAr: string; definition: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE_URL}/knowledge#termset`,
    name: "Benna Saudi Building Materials Knowledge Graph",
    description:
      "Canonical definitions of Saudi building materials, standards and procurement concepts, maintained by Benna.",
    url: `${SITE_URL}/knowledge`,
    inLanguage: ["ar", "en"],
    publisher: { "@id": `${SITE_URL}#organization` },
    hasDefinedTerm: entities.map((e) => ({
      "@type": "DefinedTerm",
      "@id": `${SITE_URL}/knowledge/${e.slug}#entity`,
      name: e.name,
      alternateName: e.nameAr,
      description: e.definition,
      url: `${SITE_URL}/knowledge/${e.slug}`,
    })),
  };
}
