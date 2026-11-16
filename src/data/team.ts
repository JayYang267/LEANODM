// Enabled roles were confirmed by the website owner on 2026-11-10.
// Source notes stay in this configuration and are never rendered on the page.
export const teamSection = {
  title: 'Product Development & Manufacturing Team',
  navigationLabel: 'Project Team',
} as const;

export const teamRoles = [
  // Project setup, confidentiality and document control.
  { name: 'Project Managers', enabled: true },
  { name: 'IP & Confidentiality Coordinators', enabled: true },
  { name: 'Document Control Specialists', enabled: true },

  // Product design, engineering and market requirements.
  { name: 'Industrial Designers', enabled: true },
  { name: 'Mechanical Design Engineers', enabled: true },
  { name: 'Electronics Engineers', enabled: true },
  { name: 'Firmware Engineers', enabled: true },
  { name: 'Product Compliance Coordinators', enabled: true },

  // Sourcing, tooling and production preparation.
  { name: 'Sourcing Specialists', enabled: true },
  { name: 'Tooling Engineers', enabled: true },
  { name: 'Production Planners', enabled: true },

  // Manufacturing, equipment readiness and firmware installation.
  { name: 'Manufacturing Engineers', enabled: true },
  { name: 'Maintenance Technicians', enabled: true },
  { name: 'Production Programming Specialists', enabled: true },

  // Product verification, quality and shipment coordination.
  { name: 'Test Engineers', enabled: true },
  {
    name: 'Quality Engineers',
    enabled: true,
    source: 'src/data/quality-control-process.ts: Quality Engineer (QE); docs/quality/quality-control-process-source-qa.md: supplied workbook organization chart.',
  },
  { name: 'Logistics & Shipping Coordinators', enabled: true },
] as const;
