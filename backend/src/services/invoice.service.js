const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const invoiceDir = path.join(__dirname, '../../uploads/invoices');
fs.mkdirSync(invoiceDir, { recursive: true });

exports.generateInvoicePdf = ({ payment, sponsor, organizer, eventName }) =>
  new Promise((resolve, reject) => {
    const filename = `invoice-${payment._id}.pdf`;
    const filePath = path.join(invoiceDir, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text('SponsorMetrics BD', { align: 'left' });
    doc.fontSize(11).fillColor('#555').text('Sponsorship invoice (BDT)', { align: 'left' });
    doc.moveDown();
    doc.fillColor('#000').fontSize(12);
    doc.text(`Invoice ID: ${payment._id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Event: ${eventName || 'Sponsorship'}`);
    doc.text(`Sponsor: ${sponsor?.organizationName || sponsor?.name || 'Sponsor'}`);
    doc.text(`Organizer: ${organizer?.organizationName || organizer?.name || 'Organizer'}`);
    doc.moveDown();
    const amount = Number(payment.amount || 0);
    const vat = payment.vatAmount != null ? Number(payment.vatAmount) : 0;
    const ait = payment.aitAmount != null ? Number(payment.aitAmount) : 0;
    doc.text(`Subtotal: BDT ${amount.toLocaleString()}`);
    if (vat) doc.text(`VAT: BDT ${vat.toLocaleString()}`);
    if (ait) doc.text(`AIT: BDT ${ait.toLocaleString()}`);
    doc.fontSize(14).text(`Total: BDT ${(amount + vat + ait).toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(10).fillColor('#666').text(`Gateway ref: ${payment.paymentGatewayRef || payment.bkashPaymentID || 'sandbox'}`);
    doc.text('Held in escrow until the post-event report is approved.');
    doc.end();

    stream.on('finish', () => resolve({ filePath, url: `/uploads/invoices/${filename}` }));
    stream.on('error', reject);
  });
