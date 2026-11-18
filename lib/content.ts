export type PackageInfo = {
  slug: string;
  name: string;
  price: number;
  tagline: string;
  popular?: boolean;
  features: string[];
};

export const packages: PackageInfo[] = [
  {
    slug: "standard",
    name: "Standard",
    price: 299,
    tagline: "Formatted and published on Amazon worldwide.",
    features: [
      "Professional print & ebook formatting",
      "Free AI book cover, designer-polished",
      "Publishing on Amazon KDP",
      "Amazon global marketplaces",
    ],
  },
  {
    slug: "essential",
    name: "Essential",
    price: 499,
    tagline: "Edited and in 40+ stores, not just Amazon.",
    popular: true,
    features: [
      "Everything in Standard",
      "Professional editing",
      "Distribution to 40+ marketplaces",
      "Barnes & Noble, Kobo, Apple Books, Google Books, Lulu & more",
    ],
  },
  {
    slug: "professional",
    name: "Professional",
    price: 899,
    tagline: "Everything, plus a premium author presence.",
    features: [
      "Everything in Essential",
      "Amazon A+ Content for your book page",
      "Your own author website",
    ],
  },
];

export function fullPrice(list: number) {
  return Math.round(list * 0.87);
}

export function money(n: number) {
  return "$" + n;
}

export function findPackage(slug: string | null) {
  return packages.find((p) => p.slug === slug) ?? packages[1];
}

export const steps = [
  {
    n: "01",
    title: "Choose & check out",
    body: "Pick Standard, Essential or Professional and sign up in a few minutes.",
  },
  {
    n: "02",
    title: "Kickoff call with Anees",
    body: "Book a time on the calendar right after checkout. We review your manuscript and goals.",
  },
  {
    n: "03",
    title: "Edit & format",
    body: "Professional editing (Essential and Professional) and print-ready paperback and ebook formatting.",
  },
  {
    n: "04",
    title: "Your free cover",
    body: "Create concepts in the AI Cover Studio; our designers polish your favourite for print.",
  },
  {
    n: "05",
    title: "Publish worldwide",
    body: "Live on Amazon and its global marketplaces, or 40+ stores including Barnes & Noble, Kobo and Apple Books.",
  },
];

export const included = [
  {
    title: "Professional book formatting",
    body: "Print-ready paperback interior and ebook files.",
    tier: "Standard · Essential · Professional",
  },
  {
    title: "Free AI book cover",
    body: "Concepts from the AI Cover Studio, polished by our designers.",
    tier: "Standard · Essential · Professional",
  },
  {
    title: "Amazon & global marketplaces",
    body: "Published on Amazon KDP across Amazon’s global stores.",
    tier: "Standard · Essential · Professional",
  },
  {
    title: "Professional editing",
    body: "Your manuscript edited before it goes to print.",
    tier: "Essential · Professional",
  },
  {
    title: "40+ marketplaces",
    body: "Barnes & Noble, Lulu, Kobo, Google Books, Apple Books and more.",
    tier: "Essential · Professional",
  },
  {
    title: "Amazon A+ Content",
    body: "Rich images and comparison modules on your Amazon book page.",
    tier: "Professional",
  },
  {
    title: "Author website",
    body: "Your own website to showcase your book and build your audience.",
    tier: "Professional",
  },
];

export const reasons = [
  {
    n: "01",
    title: "Simple, fixed pricing",
    body: "Three packages, one clear price each. No surprise fees.",
  },
  {
    n: "02",
    title: "Everywhere readers buy",
    body: "Amazon worldwide, plus 40+ stores with Essential and Professional.",
  },
  {
    n: "03",
    title: "A real team behind you",
    body: "Editors, formatters and designers working on your book.",
  },
  {
    n: "04",
    title: "You keep the rights",
    body: "[Confirm your terms] Your book, your royalties, your name on the cover.",
  },
  {
    n: "05",
    title: "Talk to the founder",
    body: "Every author gets a kickoff call with Anees, booked right after checkout.",
  },
];

export const faqs = [
  {
    q: "Is the AI book cover really free?",
    a: "Yes. Use the AI Cover Studio to create cover concepts from your title, colour theme and idea. Your final print-ready cover is included free with every package.",
  },
  {
    q: "What’s the difference between the packages?",
    a: "Standard ($299) covers formatting and publishing on Amazon and its global marketplaces. Essential ($499) adds professional editing and distribution to 40+ marketplaces. Professional ($899) adds Amazon A+ Content and your own author website.",
  },
  {
    q: "What happens after I check out?",
    a: "You get your receipt and login by email, then book your kickoff call with Anees on the calendar and upload your manuscript.",
  },
  {
    q: "How long does publishing take?",
    a: "[Your typical timeline for each package.]",
  },
  {
    q: "Who owns the rights and royalties?",
    a: "[State your terms clearly here.]",
  },
  {
    q: "Can I pay monthly?",
    a: "Yes. Every package has a monthly plan: pay $99 today to start your project, then the rest in easy monthly payments. Prefer to pay upfront? Pay in full and save 13%. [Confirm the number of monthly payments for each package.]",
  },
];

export const books: { src: string; title: string; author?: string }[] = [
  { src: "/media/cover-pickup-pals.jpg", title: "Pickup Pals", author: "Melinda M. Fons" },
  { src: "/media/cover-unshaken.jpg", title: "Unshaken", author: "Gregory L. Parrish" },
  { src: "/media/cover-brave-like-sunny.jpg", title: "Brave Like Sunny", author: "Caroline Blakeslee" },
  { src: "/media/cover-choices.jpg", title: "Choices to Live By", author: "Jon Shattuck" },
  { src: "/media/cover-coffee.jpg", title: "Coffee with Jesus", author: "Karen Slater" },
  { src: "/media/cover-1.webp", title: "Glacier's Endpoint", author: "Eliza Vance" },
  { src: "/media/cover-2.webp", title: "Shadows Beneath Neon Rain" },
  { src: "/media/cover-3.webp", title: "Azure Trespass" },
  { src: "/media/cover-4.webp", title: "Fluidity", author: "Dr. Elara Vance" },
  { src: "/media/cover-5.webp", title: "Ooey Grooey's Big Blob Day" },
  { src: "/media/cover-6.webp", title: "The Last Crown of Eldoria" },
  { src: "/media/cover-7.webp", title: "The Lumina Spore" },
  { src: "/media/cover-8.webp", title: "Silhouettes of Dust" },
  { src: "/media/cover-9.webp", title: "The Heart of Awakening" },
];

export const coverThemes = [
  { name: "Midnight Gold", bg: "#0F1B2D", fg: "#F6F1E7", mo: "#E0A33A" },
  { name: "Crimson", bg: "#5B1E24", fg: "#FBEFE6", mo: "#E8A87C" },
  { name: "Forest", bg: "#23392F", fg: "#EEF2E6", mo: "#B9D18B" },
  { name: "Ocean", bg: "#123E5A", fg: "#EAF4F8", mo: "#7FC4D8" },
  { name: "Blush", bg: "#F2D7CF", fg: "#3B1F1A", mo: "#B5524A" },
  { name: "Classic Mono", bg: "#F4F1EA", fg: "#141414", mo: "#141414" },
];

export const speeds = [0.75, 1, 1.25, 1.5, 2];
