/* Real iklipse assets pulled from iklipseworld.com (Webflow CDN). */

const CDN = "https://cdn.prod.website-files.com";

export const img = {
  emblemWhite: `${CDN}/681d25174e5c6a31f12a7ff0/688c0a34e2e799fe71757d23_685171c4e6fa4eb5db582212_Orange%20Emblem%20New%20White.svg`,
  heroCover: `${CDN}/681d25184e5c6a31f12a8077/69fe45cfef1d238071297bb9_coverr.jpg.jpeg`,
  gradient1: `${CDN}/681d25174e5c6a31f12a7ff0/6852c2c902ab76eccdb9c056_Gradient1.webp`,
  gradient2: `${CDN}/681d25174e5c6a31f12a7ff0/68557af614c4d6de542c71fa_Gradient2.webp`,
  macbook: `${CDN}/681d25184e5c6a31f12a8077/68253d3fa8b01be0bc4a8bc9_66b25b8496945bf452fbfdbc_Macbook%20Mockup%201600.avif`,
  screenMock: `${CDN}/681d25184e5c6a31f12a8077/68306a8878aa01087f2b3316_Screen%20mockup%20(REPLACE%20FILL).avif`,
  toastio: `${CDN}/681d25184e5c6a31f12a8077/682c9efebaf312b1627015b9_toastio.avif`,
  branding: `${CDN}/681d25174e5c6a31f12a7ff0/687104b23567c98e5f47c445_Branding2.webp`,
  seo: `${CDN}/681d25174e5c6a31f12a7ff0/687104b2a733c55f12461251_SEO2.webp`,
  prod: `${CDN}/681d25174e5c6a31f12a7ff0/687104b29ad524ea851bdf92_Prod1.webp`,
  na: `${CDN}/681d25174e5c6a31f12a7ff0/687e5e0950e19fabb2de90e3_6823a0af0009ab7af3607565_NA.webp`,
  portfolio4: `${CDN}/681d25174e5c6a31f12a7ff0/698ce6b41f57cd63d7a6270f_4.jpg`,
  blueEyes: `${CDN}/681d25174e5c6a31f12a7ff0/6855789d65b5ca9a46bd5708_Blue%20Eyes.webp`,
  strawberry: `${CDN}/681d25184e5c6a31f12a8077/6a023466fd6a33554aaa555e_Shot_7_Strawberry_9%20copy.webp`,
  poster: `${CDN}/681d25174e5c6a31f12a7ff0/6821dcf9436a68d7077ce9f4_Poster%202.webp`,
} as const;

const SITE = "https://iklipseworld.com";

/* Real iklipse case studies ("works") scraped from iklipseworld.com/works */
export const products = [
  { name: "Vitrac", thumb: `${CDN}/681d25184e5c6a31f12a8077/698cea98c855e0c6f509dab9_hf_20260211_203810_e6bb38da-d906-45aa-9897-ee0a5735ffd0.jpeg`, href: `${SITE}/work/vitrac` },
  { name: "Hardee's", thumb: `${CDN}/681d25184e5c6a31f12a8077/6a01f781ece83699323dde48_698ce6b41f57cd63d7a6270f_4.jpg`, href: `${SITE}/work/hardees` },
  { name: "Schweppes", thumb: `${CDN}/681d25184e5c6a31f12a8077/6a023466fd6a33554aaa555e_Shot_7_Strawberry_9%20copy.webp`, href: `${SITE}/work/schweppes` },
  { name: "ElMenus", thumb: `${CDN}/681d25184e5c6a31f12a8077/6a041ef87955539134bef8f9_698cdfb91c634ff0ab752e59_694ec659a17ff86e7dc9455b_11.avif`, href: `${SITE}/work/elmenus` },
  { name: "Bank of Muscat", thumb: `${CDN}/681d25184e5c6a31f12a8077/69fe5c11660858e969a2cae5_bom%20thumb.webp`, href: `${SITE}/work/bank-of-muscat` },
  { name: "Hannovæ", thumb: `${CDN}/681d25184e5c6a31f12a8077/694d97389212addaeed6e03e_Picture%209%20copy.avif`, href: `${SITE}/work/hannovae` },
  { name: "Saudi Basketball Federation", thumb: `${CDN}/681d25184e5c6a31f12a8077/69337a2016834589a539e0f6_1920x1080%20copy.avif`, href: `${SITE}/work/saudi-basketball-federation` },
  { name: "Toastio", thumb: `${CDN}/681d25184e5c6a31f12a8077/682c9efebaf312b1627015b9_toastio.avif`, href: `${SITE}/work/toastio` },
  { name: "UNUM", thumb: `${CDN}/681d25184e5c6a31f12a8077/68239e0a145625a862bd6107_UNUM%20Book%20copy.avif`, href: `${SITE}/work/unum` },
  { name: "Unimidi", thumb: `${CDN}/681d25184e5c6a31f12a8077/68253d3fa8b01be0bc4a8bc9_66b25b8496945bf452fbfdbc_Macbook%20Mockup%201600.avif`, href: `${SITE}/work/unimidi` },
  { name: "Doers", thumb: `${CDN}/681d25184e5c6a31f12a8077/69fe45cfef1d238071297bb9_coverr.jpg.jpeg`, href: `${SITE}/work/doers` },
  { name: "Taraddod", thumb: `${CDN}/681d25184e5c6a31f12a8077/68306a8878aa01087f2b3316_Screen%20mockup%20(REPLACE%20FILL).avif`, href: `${SITE}/work/taraddod` },
  { name: "QR8Ed", thumb: `${CDN}/681d25184e5c6a31f12a8077/694d8bac589fe054120b5d4d_Artboard%201%20copy%2022.avif`, href: `${SITE}/work/qr8ed` },
  { name: "Fetiret Dina Farms", thumb: `${CDN}/681d25184e5c6a31f12a8077/683ca1b65d87f025fe08ebb4_Fetiret%20Thumb.avif`, href: `${SITE}/work/fetiret-dina-farms` },
  { name: "Dina Farms", thumb: `${CDN}/681d25184e5c6a31f12a8077/6838b6e3c57366d439865fff_Juice%20copy.avif`, href: `${SITE}/work/dina-farms` },
  { name: "NetAesthetics", thumb: `${CDN}/681d25184e5c6a31f12a8077/6823a0af0009ab7af3607565_NA.avif`, href: `${SITE}/work/netaesthetics` },
  { name: "Balissima", thumb: `${CDN}/681d25184e5c6a31f12a8077/694d78afd33c4ca818fd5c02_1%20(Large)%20(3)%20copy.avif`, href: `${SITE}/work/balissima` },
  { name: "K By Kidda", thumb: `${CDN}/681d25184e5c6a31f12a8077/68e14cf5ba6a7d6cea89deeb_Thumb.avif`, href: `${SITE}/work/k-by-kidda` },
  { name: "Droyd", thumb: `${CDN}/681d25184e5c6a31f12a8077/68dc0c6f1daca4b32a6f7a5d_thumb.avif`, href: `${SITE}/work/droyd` },
  { name: "SFS", thumb: `${CDN}/681d25184e5c6a31f12a8077/6830cae738801ea5d91f7d5b_SFS%20Thumb%20new.avif`, href: `${SITE}/work/sfs` },
  { name: "Colourpig", thumb: `${CDN}/681d25184e5c6a31f12a8077/694ed91f275434728f49dcb3_Screenshot_20%20copy.avif`, href: `${SITE}/work/colorpig` },
  { name: "Reptile House", thumb: `${CDN}/681d25184e5c6a31f12a8077/68dbe673115b37dd3a27ce6b_reptile-thumb.avif`, href: `${SITE}/work/reptile-house` },
  { name: "Hope Energy", thumb: `${CDN}/681d25184e5c6a31f12a8077/694ed27808a404815adfb497_Cans%20of%20hope%20Orange%20(5)%20(Large)%20copy.avif`, href: `${SITE}/work/hope-energy` },
  { name: "Maison Mulleras", thumb: `${CDN}/681d25184e5c6a31f12a8077/694edac13c9d2dc640b5d2d8_2%20(2)%20(Large)%20copy.avif`, href: `${SITE}/work/maison-mulleras` },
] as const;

/* Hero showreels (Vimeo, unlisted - hash in h=) */
export const showreels = {
  service: {
    label: "All-round showreel",
    desc: "Branding, production, post and social - the full studio.",
    embed: "https://player.vimeo.com/video/1117470891?h=23980074c0",
    link: "https://vimeo.com/1117470891/23980074c0",
    thumb: `${CDN}/681d25184e5c6a31f12a8077/69fe45cfef1d238071297bb9_coverr.jpg.jpeg`,
  },
  ai: {
    label: "AI production reel",
    desc: "What people love us for - AI-infused content at scale.",
    embed: "https://player.vimeo.com/video/1141474440?h=b30eb741bd",
    link: "https://vimeo.com/1141474440/b30eb741bd",
    thumb: `${CDN}/681d25174e5c6a31f12a7ff0/6855789d65b5ca9a46bd5708_Blue%20Eyes.webp`,
  },
} as const;

export const footerNav = {
  explore: [
    { label: "Home", href: `${SITE}/` },
    { label: "About", href: `${SITE}/about` },
    { label: "Services", href: `${SITE}/services` },
    { label: "Works", href: `${SITE}/works` },
    { label: "Blog", href: `${SITE}/blog` },
    { label: "Contact", href: `${SITE}/contact` },
  ],
  social: [
    { label: "Instagram", href: "https://www.instagram.com/iklipse_" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/iklipseworld" },
    { label: "Threads", href: "https://www.threads.com/@iklipse_" },
    { label: "Fiverr", href: "https://www.fiverr.com/agencies/digiredo" },
  ],
  legal: [
    { label: "Terms of Use", href: `${SITE}/terms` },
    { label: "Privacy Policy", href: `${SITE}/privacy-policy` },
    { label: "Cookie Policy", href: `${SITE}/cookie-policy` },
    { label: "Disclaimer", href: `${SITE}/disclaimer` },
  ],
  contact: `${SITE}/contact`,
} as const;

export const clientLogos = [
  { name: "DB Schenker", src: `${CDN}/681d25184e5c6a31f12a8077/6838cc5c21ce90975ad07fba_DB%20Schenker.avif` },
  { name: "Sheraton", src: `${CDN}/681d25184e5c6a31f12a8077/6838ccd064fd15ab99b1b81e_Sheraton.avif` },
  { name: "Tide", src: `${CDN}/681d25184e5c6a31f12a8077/68ea54d2a560a2cc45081c2e_Tide%20Logo%20White.avif` },
  { name: "Elmenus", src: `${CDN}/681d25184e5c6a31f12a8077/68ea54e0d8c705db05e20e6e_Elmenus%20Logo%20White.avif` },
  { name: "Fresh", src: `${CDN}/681d25184e5c6a31f12a8077/6838cc8221ce90975ad096fd_Fresh.avif` },
  { name: "CityStars", src: `${CDN}/681d25184e5c6a31f12a8077/69e125693b2462ec85984b40_CityStars_Logo_White.png` },
  { name: "Dina Farms", src: `${CDN}/681d25184e5c6a31f12a8077/6838cc6f9cad3da06ee6cedf_Dina%20Farms.avif` },
  { name: "e&", src: `${CDN}/681d25184e5c6a31f12a8077/69337ac849bdc5a8ce9bfab9_Eand_Logo_EN.svg.avif` },
  { name: "EMT", src: `${CDN}/681d25184e5c6a31f12a8077/6838cc733b50d79246c2aa8f_EMT.svg` },
  { name: "Kazoku", src: `${CDN}/681d25184e5c6a31f12a8077/6838cca31b74e37b6aedb7b8_Kazoku.avif` },
  { name: "Mori", src: `${CDN}/681d25184e5c6a31f12a8077/6838ccb375fef1552d34d5b9_Mori.avif` },
  { name: "Peking", src: `${CDN}/681d25184e5c6a31f12a8077/6838ccbca654e8ab2b84d6ea_Peking.avif` },
  { name: "Sachi", src: `${CDN}/681d25184e5c6a31f12a8077/6838cccb1781d1084d5c6dd6_Sachi.avif` },
  { name: "Saudi Basketball Federation", src: `${CDN}/681d25184e5c6a31f12a8077/683c6fbaba65ade0139ff78f_SBF.avif` },
  { name: "Hardee's", src: `${CDN}/681d25184e5c6a31f12a8077/6967dd3af76f338077d7baf4_hardee%20copy%20copy.webp` },
  { name: "Image Store", src: `${CDN}/681d25184e5c6a31f12a8077/6838cc910c55c8f16315fd33_Image%20Store.avif` },
  { name: "B Auto", src: `${CDN}/681d25184e5c6a31f12a8077/6838cc523badcfb757dd8505_B%20Auto.avif` },
  { name: "Marbella", src: `${CDN}/681d25184e5c6a31f12a8077/6838ccacc64d6bcc91d29dc9_Marbella.avif` },
] as const;
