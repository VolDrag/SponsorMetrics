const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const Contract = require('../models/Contract');
const Event = require('../models/Event');
const SponsorshipTier = require('../models/SponsorshipTier');
const User = require('../models/User');

const contractDir = path.join(__dirname, '../../uploads/contracts');
fs.mkdirSync(contractDir, { recursive: true });

const hashPayload = (text) => crypto.createHash('sha256').update(text).digest('hex');

const writeContractPdf = (filePath, body, documentHash) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(18).text('SponsorMetrics BD', { align: 'left' });
    doc.fontSize(14).text('Sponsorship contract');
    doc.moveDown();
    doc.fontSize(11).text(body);
    doc.moveDown();
    doc.fontSize(9).fillColor('#666').text(`Document hash: ${documentHash || ''}`);
    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

exports.createContractForProposal = async (proposal, deal) => {
  const event = await Event.findById(proposal.eventId);
  const tier = proposal.selectedTierId
    ? await SponsorshipTier.findById(proposal.selectedTierId)
    : null;
  const organizer = await User.findById(proposal.organizerId).select('name organizationName');
  const sponsor = await User.findById(proposal.sponsorId).select('name organizationName');
  const benefits = (tier?.benefits || []).map((row) => row.label).filter(Boolean);

  let contract = await Contract.findOne({ dealId: deal._id });
  if (!contract) {
    contract = await Contract.create({
      dealId: deal._id,
      proposalId: proposal._id,
      organizerId: proposal.organizerId,
      sponsorId: proposal.sponsorId,
      agreedBudget: proposal.proposedBudget || 0,
      eventDates: event?.date || new Date(),
      promisedMaterials: benefits,
      status: 'unsigned',
    });
  }

  const body = [
    'SPONSORSHIP AGREEMENT',
    `Event: ${event?.name || 'Event'}`,
    `Venue: ${event?.venue || 'n/a'}`,
    `Date: ${event?.date ? new Date(event.date).toLocaleDateString() : 'n/a'}`,
    `Organizer: ${organizer?.organizationName || organizer?.name}`,
    `Sponsor: ${sponsor?.organizationName || sponsor?.name}`,
    `Package: ${tier?.name || 'Custom'}`,
    `Agreed budget: BDT ${Number(proposal.proposedBudget || 0).toLocaleString()}`,
    `Deliverables: ${benefits.join(', ') || 'As negotiated'}`,
    `Generated: ${new Date().toISOString()}`,
  ].join('\n');

  contract.documentHash = hashPayload(body);
  const filename = `contract-${contract._id}.pdf`;
  const filePath = path.join(contractDir, filename);

  await writeContractPdf(filePath, body, contract.documentHash);

  contract.pdfUrl = `/uploads/contracts/${filename}`;
  await contract.save();
  return contract;
};

exports.contractFilePath = (contractId) => path.join(contractDir, `contract-${contractId}.pdf`);

exports.ensureContractPdf = async (contract) => {
  const filePath = exports.contractFilePath(contract._id);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 80) {
    return filePath;
  }

  const Proposal = require('../models/Proposal');
  const proposal = contract.proposalId ? await Proposal.findById(contract.proposalId).select('eventId selectedTierId') : null;
  const event = proposal?.eventId ? await Event.findById(proposal.eventId) : null;
  const organizer = await User.findById(contract.organizerId).select('name organizationName');
  const sponsor = await User.findById(contract.sponsorId).select('name organizationName');
  const body = [
    'SPONSORSHIP AGREEMENT',
    `Event: ${event?.name || 'Event'}`,
    `Venue: ${event?.venue || 'n/a'}`,
    `Date: ${contract.eventDates ? new Date(contract.eventDates).toLocaleDateString() : 'n/a'}`,
    `Organizer: ${organizer?.organizationName || organizer?.name}`,
    `Sponsor: ${sponsor?.organizationName || sponsor?.name}`,
    `Agreed budget: BDT ${Number(contract.agreedBudget || 0).toLocaleString()}`,
    `Deliverables: ${(contract.promisedMaterials || []).join(', ') || 'As negotiated'}`,
    `Generated: ${new Date().toISOString()}`,
  ].join('\n');
  if (!contract.documentHash) {
    contract.documentHash = hashPayload(body);
    await contract.save();
  }
  await writeContractPdf(filePath, body, contract.documentHash);
  contract.pdfUrl = `/uploads/contracts/${path.basename(filePath)}`;
  await contract.save();
  return filePath;
};

exports.signContract = async (contract, user, { fullName, ip }) => {
  if (contract.status === 'executed') {
    const err = new Error('Contract is already executed and immutable');
    err.statusCode = 400;
    throw err;
  }
  const role = String(user._id) === String(contract.organizerId) ? 'organizer' : 'sponsor';
  if (role === 'organizer' && String(user._id) !== String(contract.organizerId)) {
    const err = new Error('Not a party to this contract');
    err.statusCode = 403;
    throw err;
  }
  const signature = {
    fullName: String(fullName || user.name).trim(),
    signedAt: new Date(),
    ip: ip || '',
    documentHash: contract.documentHash,
  };
  if (role === 'organizer') {
    contract.organizerSignature = signature;
    contract.signedByOrganizer = true;
  } else {
    contract.sponsorSignature = signature;
    contract.signedBySponsor = true;
  }
  if (contract.signedByOrganizer && contract.signedBySponsor) {
    contract.status = 'executed';
    contract.executedAt = new Date();
  } else {
    contract.status = 'partially_signed';
  }
  await contract.save();
  return contract;
};
