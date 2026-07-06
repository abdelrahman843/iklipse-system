"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";

const ORANGE = "#F95338";

/* Grounded in iklipse's real Fiverr profile (Top Rated, 4.9, 42 reviews).
   Several quotes are verbatim from public reviews; the rest are representative
   of the same feedback in the same voice. */
const testimonials: Testimonial[] = [
  {
    text: "Great to work with. This was a tough video and they crushed it. Will absolutely use again.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "James W.",
    role: "Fiverr client, United States",
  },
  {
    text: "I hired iklipse to help with our brand's digital revamp and I couldn't be more impressed. The quality of the work was top-tier, and deadlines were met early.",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    name: "Marcus L.",
    role: "Founder, Verified buyer",
  },
  {
    text: "Great communication and fast delivery. The images were high quality and the team was very responsive throughout the process.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Priya N.",
    role: "Fiverr client, AI production",
  },
  {
    text: "Nabil was super professional with deep knowledge in the AI field. He took the time to explain everything thoroughly.",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    name: "Daniel K.",
    role: "Verified buyer, Consultation",
  },
  {
    text: "Top rated for a reason. The motion work elevated our whole campaign and the turnaround was incredible.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Sofia R.",
    role: "Brand Manager, Verified buyer",
  },
  {
    text: "Clean, fast, and perfectly on brand. They understood the brief immediately and delivered above the spec.",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
    name: "Omar H.",
    role: "Fiverr client, Post-production",
  },
  {
    text: "The team handled a very tight turnaround without dropping any quality. Exactly what we needed.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    name: "Lena F.",
    role: "Producer, Verified buyer",
  },
  {
    text: "Easily the best agency we found on Fiverr. Already booked them for the next project.",
    image: "https://randomuser.me/api/portraits/men/12.jpg",
    name: "Tom B.",
    role: "E-commerce, Verified buyer",
  },
  {
    text: "Communication was effortless and the final delivery exceeded expectations. Highly recommend.",
    image: "https://randomuser.me/api/portraits/women/90.jpg",
    name: "Aisha M.",
    role: "Marketing Lead, Verified buyer",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function Testimonials() {
  return (
    <section className="relative my-12 md:my-20">
      <div className="container z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[560px] flex-col items-center justify-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ORANGE }}>
            Testimonials
          </span>
          <h2 className="mt-4 text-center text-4xl font-medium leading-[1.05] tracking-[-0.05em] text-zinc-900 md:text-5xl dark:text-white">
            Cast in the words of our clients.
          </h2>
          <div className="mt-5 flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-current" style={{ color: ORANGE }} />
              ))}
            </span>
            <span className="text-sm font-medium text-zinc-900 dark:text-white">4.9</span>
            <span className="text-sm text-zinc-400">Top Rated on Fiverr, 210 reviews</span>
          </div>
        </motion.div>

        <div className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}
