const Contract = require('../models/Contract');
const { signContract } = require('../services/contract.service');

exports.listMine = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : { $or: [{ organizerId: req.user._id }, { sponsorId: req.user._id }] };
    const rows = await Contract.find(filter)
      .populate('organizerId', 'name organizationName')
      .populate('sponsorId', 'name organizationName')
      .populate('proposalId', 'proposedBudget status')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list contracts', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    const uid = String(req.user._id);
    if (
      req.user.role !== 'admin' &&
      String(contract.organizerId) !== uid &&
      String(contract.sponsorId) !== uid
    ) {
      return res.status(403).json({ success: false, message: 'Not a party to this contract' });
    }
    res.json({ success: true, data: contract });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load contract', error: error.message });
  }
};

exports.sign = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    const uid = String(req.user._id);
    if (String(contract.organizerId) !== uid && String(contract.sponsorId) !== uid) {
      return res.status(403).json({ success: false, message: 'Not a party to this contract' });
    }
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip;
    const signed = await signContract(contract, req.user, { fullName: req.body.fullName, ip });
    res.json({ success: true, data: signed, message: 'Signature recorded' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    const uid = String(req.user._id);
    if (
      req.user.role !== 'admin' &&
      String(contract.organizerId) !== uid &&
      String(contract.sponsorId) !== uid
    ) {
      return res.status(403).json({ success: false, message: 'Not a party to this contract' });
    }
    const { ensureContractPdf } = require('../services/contract.service');
    const filePath = await ensureContractPdf(contract);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="contract-${contract._id}.pdf"`);
    return res.sendFile(require('path').resolve(filePath));
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to download contract PDF', error: error.message });
  }
};
