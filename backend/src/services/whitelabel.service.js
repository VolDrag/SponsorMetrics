const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const cron = require('node-cron');
const WhiteLabelReport = require('../models/WhiteLabelReport');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { sendInvoiceEmail } = require('./email.service');

const dir = path.join(__dirname, '../../uploads/reports-white');
fs.mkdirSync(dir, { recursive: true });

const buildPdf = (sponsor, campaigns) =>
  new Promise((resolve, reject) => {
    const filename = `weekly-${sponsor._id}-${Date.now()}.pdf`;
    const filePath = path.join(dir, filename);
    const doc = new PDFDocument({ margin: 48 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(18).text(sponsor.organizationName || sponsor.name);
    doc.fontSize(12).text('Weekly sponsorship summary');
    doc.moveDown();
    campaigns.forEach((row) => {
      doc.fontSize(11).text(`${row.eventId?.name || 'Event'} — BDT ${Number(row.spend || 0).toLocaleString()} (${row.status})`);
    });
    doc.end();
    stream.on('finish', () => resolve({ filePath, url: `/uploads/reports-white/${filename}` }));
    stream.on('error', reject);
  });

exports.generateForSponsor = async (sponsorId) => {
  const sponsor = await User.findById(sponsorId);
  const campaigns = await Campaign.find({ sponsorId }).populate('eventId', 'name date');
  const pdf = await buildPdf(sponsor, campaigns);
  const period = new Date().toISOString().slice(0, 10);
  const row = await WhiteLabelReport.create({
    sponsorId,
    periodCovered: period,
    pdfUrl: pdf.url,
    scheduledDelivery: true,
    deliveryDay: 'monday',
  });
  if (sponsor?.email) {
    await sendInvoiceEmail(sponsor.email, sponsor.name, pdf.filePath, { invoiceNumber: `WL-${period}`, amount: 0 }).catch(() => {});
  }
  return row;
};

exports.startScheduler = () => {
  cron.schedule('0 9 * * 1', async () => {
    const sponsors = await User.find({ role: 'sponsor', isActive: true }).select('_id');
    for (const sponsor of sponsors) {
      await exports.generateForSponsor(sponsor._id).catch((err) => console.warn('[white-label]', err.message));
    }
  });
};
