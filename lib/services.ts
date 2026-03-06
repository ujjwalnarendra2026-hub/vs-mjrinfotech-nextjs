export type ServiceData = {
  title: string;
  image: string;
  badge: string;
  sections: { heading: string; content: string; list?: string[] }[];
};

export const servicesData: Record<string, ServiceData> = {
  "dms-crm-implementation": {
    title: "DMS/CRM Implementation & Helpdesk",
    image: "/images/service-app-rollout.png",
    badge: "Services",
    sections: [
      {
        heading: "DMS/CRM Implementation & Helpdesk",
        content:
          "End-to-end DMS/CRM/SFA rollout, onsite/remote handholding training, user adoption programs, daily issue resolution, and reliable 24×7 first-level helpdesk support – specialized for FMCG & distribution sectors.",
      },
      {
        heading: "Our Approach",
        content:
          "Our trainers combine both software & domain skills. We provide training onsite, offshore, or via remote sessions. The real value of your software depends on how people use it — training has a critical role in ensuring smooth rollout focused on adoption.",
      },
      {
        heading: "Helpdesk Support Capabilities",
        content: "",
        list: [
          "Excellent communication skills",
          "Troubleshooting and problem-solving",
          "Ability to explain technical information clearly",
          "Ability to prioritize and multitask efficiently",
          "Knowledge of call tracking applications",
          "Collaborative team spirit",
          "Analytical and process-oriented approach",
        ],
      },
    ],
  },
  "power-bi-outsourcing": {
    title: "Power BI Project Outsourcing",
    image: "/images/service-consulting.jpg",
    badge: "Services",
    sections: [
      {
        heading: "Power BI Project Outsourcing",
        content:
          "Complete Power BI development services – dashboard design, DAX, data modeling, report automation, and integrations. Flexible project outsourcing or dedicated resource models for your analytics needs.",
      },
      {
        heading: "What We Offer",
        content: "",
        list: [
          "Custom Dashboard Design & Development",
          "DAX Calculations & Data Modeling",
          "Report Automation & Scheduling",
          "Data Integration from Multiple Sources",
          "Dedicated Resource or Project-Based Models",
          "Training & Knowledge Transfer",
        ],
      },
    ],
  },
  "recruitment-staffing": {
    title: "Recruitment & Staffing",
    image: "/images/service-recruitment.jpg",
    badge: "Services",
    sections: [
      {
        heading: "Recruitment & Staffing",
        content:
          "Bulk tech talent sourcing – DMS engineers, Power BI developers, Tally experts, and trained freshers. Contract, C2H, or permanent placements with quick onboarding across India.",
      },
      {
        heading: "Staffing Models",
        content: "",
        list: [
          "Contract Staffing",
          "Contract-to-Hire (C2H)",
          "Permanent Placements",
          "Bulk Hiring for Projects",
          "Fresher Training & Deployment",
        ],
      },
    ],
  },
  "tally-solutions": {
    title: "Tally Solutions with GST & Taxation Compliance",
    image: "/images/service-infrastructure.png",
    badge: "Certified Tally Partner",
    sections: [
      {
        heading: "Best Tally Certified Partner in Indore, MP",
        content:
          "VS-MJR Infotech – your trusted Tally partner in Indore. With our expertise and dedication, we provide unparalleled service and support for all your Tally software needs.",
      },
      {
        heading: "Tally Data Connector (TDC)",
        content:
          "Link any software to Tally using TDC – transfer Sale, Purchase, Payment, Receipt, Credit Note, Debit Note & JV Entries from any software to Tally. Supports Fox Pro, Access, SQL Server, Oracle, MySQL, Excel, and more.",
      },
      {
        heading: "Our Offerings",
        content: "",
        list: [
          "Tally Prime Sales & Implementation",
          "Customization & Add-on Development",
          "Data Migration & Integration",
          "GST Filing Support & Compliance",
          "Taxation Module Setup",
          "Tally Data Connector (TDC) Integration",
          "Annual Maintenance Contracts (AMC)",
        ],
      },
    ],
  },
  "software-development": {
    title: "Software Development",
    image: "/images/service-webdev.png",
    badge: "Services",
    sections: [
      {
        heading: "Software Development",
        content:
          "Custom software development, web applications, enterprise solutions, and system integrations – built with modern technologies tailored to your business workflows.",
      },
      {
        heading: "What We Offer",
        content: "",
        list: [
          "Custom Software & Application Development",
          "Web Application Development",
          "Enterprise Solutions & ERP Integration",
          "API Development & Third-Party Integrations",
          "UI/UX Design & Prototyping",
          "Maintenance & Support",
        ],
      },
    ],
  },
  "education-skill-development": {
    title: "Education & Skill Development – Educerns Venture",
    image: "/images/service-webdev.png",
    badge: "Services",
    sections: [
      {
        heading: "Education & Skill Development – Educerns Venture",
        content:
          "Industry-relevant IT certification courses, corporate training programs (Power BI, Tally, DMS etc.), and skill development initiatives through our Educerns joint venture – with placement support.",
      },
      {
        heading: "Programs We Offer",
        content: "",
        list: [
          "Power BI Certification & Training",
          "Tally Prime with GST Training",
          "DMS/CRM Software Training",
          "Corporate Training Programs",
          "Skill Development for Freshers",
          "Placement Assistance & Support",
        ],
      },
    ],
  },
};

export const serviceDescriptions: Record<string, string> = {
  "dms-crm-implementation":
    "End-to-end DMS/CRM/SFA rollout, onsite/remote training, user adoption programs, and 24×7 first-level helpdesk support for FMCG & distribution sectors across India.",
  "power-bi-outsourcing":
    "Complete Power BI development – custom dashboards, DAX, data modeling, report automation. Flexible project outsourcing or dedicated resource model for your analytics needs.",
  "recruitment-staffing":
    "Bulk IT talent sourcing – DMS engineers, Power BI developers, Tally experts. Contract, C2H, or permanent placements with quick onboarding across India.",
  "tally-solutions":
    "Certified Tally Partner in Indore – Tally Prime sales, implementation, GST compliance, customization, TDC integrations, and Annual Maintenance Contracts (AMC).",
  "software-development":
    "Custom software, web applications, enterprise solutions, and system integrations built with modern technologies tailored to your business workflows.",
  "education-skill-development":
    "Industry-relevant IT courses, corporate training (Power BI, Tally, DMS), and skill development via our Educerns joint venture with placement support.",
};

export const SERVICE_SLUGS = Object.keys(servicesData);
