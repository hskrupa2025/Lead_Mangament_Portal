const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER'
};

const LEAD_STATUSES = [
    'New',
    'Contacted',
    'Follow-up',
    'Proposal Sent',
    'Negotiation',
    'Won',
    'Lost'
];

const SERVICES = [
    'Website Development',
    'Web Application Development',
    'Mobile Application Development',
    'E-commerce',
    'SEO',
    'Digital Marketing',
    'Cloud Services',
    'IT Consulting',
    'Other'
];

const LEAD_SOURCES = [
    'Website',
    'Google',
    'LinkedIn',
    'Referral',
    'Email',
    'Phone',
    'Walk-in',
    'Social Media',
    'WhatsApp',
    'Other'
];

const FOLLOWUP_TYPES = [
    'Phone Call',
    'Email',
    'Meeting',
    'WhatsApp',
    'Demo',
    'Proposal Discussion',
    'Other'
];

module.exports = {
    ROLES,
    LEAD_STATUSES,
    SERVICES,
    LEAD_SOURCES,
    FOLLOWUP_TYPES
};