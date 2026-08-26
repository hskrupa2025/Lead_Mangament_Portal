const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Lead = require('../models/Lead');
const FollowUp = require('../models/followUp');
const { ROLES, SERVICES, LEAD_SOURCES, LEAD_STATUSES, FOLLOWUP_TYPES } = require('../config/constants');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[Seed] MongoDB Connected...');
    } catch (err) {
        console.error(`[Seed Error] Database connection failed: ${err.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        console.log('WARNING: Clearing existing development seed data...');
        await User.deleteMany();
        await Lead.deleteMany();
        await FollowUp.deleteMany();

        console.log('Creating users...');
        const salt = await bcrypt.genSalt(10);
        const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
        const userPasswordHash = await bcrypt.hash('User@123', salt);

        const adminUser = await User.create({
            name: 'System Admin',
            email: 'admin@example.com',
            passwordHash: adminPasswordHash,
            role: ROLES.ADMIN,
            isActive: true
        });

        const priya = await User.create({
            name: 'Priya Sharma',
            email: 'priya@example.com',
            passwordHash: userPasswordHash,
            role: ROLES.USER,
            isActive: true
        });

        const arun = await User.create({
            name: 'Arun Kumar',
            email: 'arun@example.com',
            passwordHash: userPasswordHash,
            role: ROLES.USER,
            isActive: true
        });

        const sneha = await User.create({
            name: 'Sneha Patel',
            email: 'sneha@example.com',
            passwordHash: userPasswordHash,
            role: ROLES.USER,
            isActive: true
        });

        console.log('Users created successfully.');

        console.log('Creating sample leads...');
        const leadsData = [
            {
                leadName: 'Rahul Sharma',
                companyName: 'Rahul Fashion Store',
                mobile: '+919876543210',
                email: 'rahul@fashion.com',
                serviceRequired: 'E-commerce',
                leadSource: 'Website',
                estimatedValue: 150000,
                assignedTo: priya._id,
                remarks: 'Interested in custom shopify or web app setup',
                status: 'Proposal Sent',
                createdBy: adminUser._id
            },
            {
                leadName: 'Ananya Verma',
                companyName: 'TechCorp Solutions',
                mobile: '+919812345678',
                email: 'ananya@techcorp.io',
                serviceRequired: 'Web Application Development',
                leadSource: 'LinkedIn',
                estimatedValue: 350000,
                assignedTo: arun._id,
                remarks: 'Requires enterprise SAAS portal',
                status: 'Negotiation',
                createdBy: adminUser._id
            },
            {
                leadName: 'Vikram Singh',
                companyName: 'Apex Logistics',
                mobile: '+919711223344',
                email: 'vikram@apexlogistics.com',
                serviceRequired: 'Mobile Application Development',
                leadSource: 'Google',
                estimatedValue: 280000,
                assignedTo: sneha._id,
                remarks: 'Cross-platform fleet tracking app required',
                status: 'New',
                createdBy: adminUser._id
            },
            {
                leadName: 'Meera Nair',
                companyName: 'GreenLeaf Organics',
                mobile: '+919655443322',
                email: 'meera@greenleaf.com',
                serviceRequired: 'SEO',
                leadSource: 'Referral',
                estimatedValue: 80000,
                assignedTo: priya._id,
                remarks: 'Monthly retainer for organic ranking improvement',
                status: 'Won',
                createdBy: adminUser._id
            },
            {
                leadName: 'Karan Mehta',
                companyName: 'Mehta Jewelers',
                mobile: '+919544332211',
                email: 'karan@mehtajewelers.com',
                serviceRequired: 'Digital Marketing',
                leadSource: 'Social Media',
                estimatedValue: 120000,
                assignedTo: arun._id,
                remarks: 'Instagram and Google Ads campaign management',
                status: 'Contacted',
                createdBy: adminUser._id
            },
            {
                leadName: 'Rohan Gupta',
                companyName: 'CloudNine Hospitals',
                mobile: '+919433221100',
                email: 'rohan@cloudnine.org',
                serviceRequired: 'Cloud Services',
                leadSource: 'Walk-in',
                estimatedValue: 500000,
                assignedTo: sneha._id,
                remarks: 'AWS infrastructure migration and security audit',
                status: 'Follow-up',
                createdBy: adminUser._id
            },
            {
                leadName: 'Siddharth Rao',
                companyName: 'FinServe Consulting',
                mobile: '+919322110099',
                email: 'siddharth@finserve.in',
                serviceRequired: 'IT Consulting',
                leadSource: 'Email',
                estimatedValue: 200000,
                assignedTo: priya._id,
                remarks: 'Digital transformation roadmap planning',
                status: 'Lost',
                createdBy: adminUser._id
            },
            {
                leadName: 'Pooja Joshi',
                companyName: 'EduSmart Academy',
                mobile: '+919211009988',
                email: 'pooja@edusmart.com',
                serviceRequired: 'Website Development',
                leadSource: 'Website',
                estimatedValue: 95000,
                assignedTo: arun._id,
                remarks: 'Responsive institutional portal with CMS',
                status: 'Proposal Sent',
                createdBy: adminUser._id
            },
            {
                leadName: 'Amit Trivedi',
                companyName: 'Trivedi Auto Components',
                mobile: '+919100998877',
                email: 'amit@trivediauto.com',
                serviceRequired: 'Other',
                leadSource: 'Phone',
                estimatedValue: 180000,
                assignedTo: sneha._id,
                remarks: 'Custom ERP integration module',
                status: 'Contacted',
                createdBy: adminUser._id
            },
            {
                leadName: 'Neha Kapoor',
                companyName: 'StyleStudio Designs',
                mobile: '+919099887766',
                email: 'neha@stylestudio.in',
                serviceRequired: 'E-commerce',
                leadSource: 'LinkedIn',
                estimatedValue: 220000,
                assignedTo: priya._id,
                remarks: 'High-end fashion retail e-commerce portal',
                status: 'Won',
                createdBy: adminUser._id
            }
        ];

        const createdLeads = await Lead.insertMany(leadsData);
        console.log(`${createdLeads.length} leads created successfully.`);

        console.log('Creating follow-up records...');
        const lead1 = createdLeads[0];
        const lead2 = createdLeads[1];

        await FollowUp.create([
            {
                leadId: lead1._id,
                createdBy: priya._id,
                date: new Date('2026-08-20T10:00:00Z'),
                followUpType: 'Phone Call',
                remarks: 'Initial enquiry discussion. Collected core requirement details.',
                nextFollowUpDate: new Date('2026-08-22T11:00:00Z')
            },
            {
                leadId: lead1._id,
                createdBy: priya._id,
                date: new Date('2026-08-22T11:30:00Z'),
                followUpType: 'Email',
                remarks: 'Sent complete commercial quotation and technical specification draft.',
                nextFollowUpDate: new Date('2026-08-26T14:00:00Z')
            },
            {
                leadId: lead2._id,
                createdBy: arun._id,
                date: new Date('2026-08-21T15:00:00Z'),
                followUpType: 'Meeting',
                remarks: 'In-person meeting at client site. Discussed portal timeline and SLA.',
                nextFollowUpDate: new Date('2026-08-25T10:00:00Z')
            }
        ]);

        console.log('Follow-ups created successfully.');
        console.log('====================================================');
        console.log('SEED COMPLETE - TEST CREDENTIALS:');
        console.log('ADMIN: Email: admin@example.com | Password: Admin@123');
        console.log('USER:  Email: priya@example.com | Password: User@123');
        console.log('USER:  Email: arun@example.com  | Password: User@123');
        console.log('USER:  Email: sneha@example.com | Password: User@123');
        console.log('====================================================');

        process.exit(0);
    } catch (error) {
        console.error(`[Seed Error] Failed to populate seed data: ${error.message}`);
        process.exit(1);
    }
};

seedData();