export interface Organization {
  id: string;
  name: string;
  type: "hospital-network" | "hospital" | "clinic" | "diagnostics" | "oncology";
  size: string; // e.g. "450 beds" or "1,200 employees"
  location: string;
  website: string;
  contactCount: number;
  dealCount: number;
  status: "active" | "prospect" | "inactive";
}

export const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    name: "Meridian Health System",
    type: "hospital-network",
    size: "450 beds",
    location: "San Francisco, CA",
    website: "meridianhealth.org",
    contactCount: 2,
    dealCount: 2,
    status: "active",
  },
  {
    id: "org-002",
    name: "Pacific Coast Medical Center",
    type: "hospital",
    size: "280 beds",
    location: "Portland, OR",
    website: "pacificcoastmedical.com",
    contactCount: 2,
    dealCount: 1,
    status: "active",
  },
  {
    id: "org-003",
    name: "BioVault Diagnostics",
    type: "diagnostics",
    size: "340 employees",
    location: "Boston, MA",
    website: "biovaultdx.com",
    contactCount: 2,
    dealCount: 2,
    status: "active",
  },
  {
    id: "org-004",
    name: "Sunrise Community Clinic",
    type: "clinic",
    size: "45 providers",
    location: "Las Vegas, NV",
    website: "sunriseclinic.net",
    contactCount: 1,
    dealCount: 1,
    status: "prospect",
  },
  {
    id: "org-005",
    name: "Alpha Oncology Partners",
    type: "oncology",
    size: "120 providers",
    location: "Los Angeles, CA",
    website: "alphaoncology.com",
    contactCount: 2,
    dealCount: 2,
    status: "active",
  },
  {
    id: "org-006",
    name: "Valley Regional Hospital",
    type: "hospital",
    size: "190 beds",
    location: "Fresno, CA",
    website: "valleyhospital.org",
    contactCount: 1,
    dealCount: 1,
    status: "prospect",
  },
  {
    id: "org-007",
    name: "ClearPath Health Partners",
    type: "clinic",
    size: "220 employees",
    location: "Austin, TX",
    website: "clearpathhealth.com",
    contactCount: 0,
    dealCount: 0,
    status: "inactive",
  },
];
