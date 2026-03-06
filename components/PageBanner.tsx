"use client";

import Link from "next/link";

interface PageBannerProps {
  title: string;
  breadcrumbs: { label: string; path?: string }[];
}

const PageBanner = ({ title, breadcrumbs }: PageBannerProps) => {
  return (
    <div className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden page-banner-bg">
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {title}
        </h2>
        <ul className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-primary">›</span>}
              {crumb.path ? (
                <Link href={crumb.path} className="text-primary hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Decorative shapes */}
      <div className="absolute top-[15%] left-[5%] w-3 h-3 rounded-full bg-primary/40" />
      <div className="absolute top-[10%] right-[15%] w-4 h-4 rounded-full bg-primary/30" />
      <div className="absolute bottom-[20%] left-[10%] w-2 h-2 rounded-full bg-primary/20" />
      <div className="absolute top-[25%] right-[8%] w-2.5 h-2.5 rounded-full bg-primary/25" />
      <div className="absolute bottom-[30%] right-[25%] w-3 h-3 rounded-full bg-primary/15" />
      <img
        src="/images/shape-13.svg"
        alt=""
        className="absolute -left-6 bottom-0 w-20 opacity-10"
      />
      <img
        src="/images/shape-13.svg"
        alt=""
        className="absolute -right-6 top-1/3 w-16 opacity-10 rotate-180"
      />
    </div>
  );
};

export default PageBanner;
