import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";

export const Reveal = ({ children, delay = 0, className = "" }) => {
  const { reducedMotion } = useApp();
  if (reducedMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
};

export const PageHeader = ({ eyebrow, title, children, right }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] text-amber-50 sm:text-5xl">{title}</h1>
      {children && <div className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">{children}</div>}
    </div>
    {right}
  </div>
);
