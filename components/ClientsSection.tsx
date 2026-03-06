"use client";

import type { Client } from "@/lib/types";

const staticClients: Client[] = [
  { id: "s1", name: "Crystaldata Software Services", logo_url: "/images/client-1.png", sort_order: 0 },
  { id: "s2", name: "Globtier", logo_url: "/images/client-2.png", sort_order: 1 },
  { id: "s3", name: "Collabera", logo_url: "/images/client-3.png", sort_order: 2 },
  { id: "s4", name: "IBM", logo_url: "/images/client-4.png", sort_order: 3 },
  { id: "s5", name: "Indian Oil", logo_url: "/images/client-5.png", sort_order: 4 },
  { id: "s6", name: "VE Commercial Vehicles", logo_url: "/images/client-7.png", sort_order: 5 },
  { id: "s7", name: "Amazon.in", logo_url: "/images/client-8.png", sort_order: 6 },
  { id: "s8", name: "3i Infotech", logo_url: "/images/client-9.png", sort_order: 7 },
];

export default function ClientsSection({ clients }: { clients?: Client[] }) {
  const list = clients && clients.length > 0 ? clients : staticClients;

  return (
    <section className="py-16 md:py-20 bg-secondary/20">
      <div className="container mx-auto px-4 text-center mb-10">
        <span className="section-title-badge">Trusted By</span>
        <h2 className="section-heading mt-1">Our Happy Clients</h2>
        <p className="text-muted-foreground mt-2 text-sm">Partnering with leading organizations across India</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 lg:gap-20">
          {list.map((client) => (
            <div key={client.id} className="flex items-center justify-center">
              <img
                src={client.logo_url}
                alt={client.name}
                className="h-10 md:h-14 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-200"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
