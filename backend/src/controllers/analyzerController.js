const { analyzeProposal } = require('../utils/proposalAnalyzer');
const Proposal = require('../models/Proposal');
const mongoose = require('mongoose');

const analyzeProposalStrength = async (req, res) => {
  try {
    const proposalData = req.body;
    if (!proposalData || Object.keys(proposalData).length === 0) {
      return res.status(400).json({ success: false, message: 'Proposal data is required' });
    }

    const result = analyzeProposal(proposalData);

    const savedProposal = await Proposal.create({
      eventId: proposalData.eventId || new mongoose.Types.ObjectId(),
      rawBulletPoints: proposalData.rawBulletPoints || proposalData.description || '',
      aiGeneratedText: proposalData.aiGeneratedText || '',
      strengthScore: result.score,
      strengthTips: result.tips,
      analyzedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      data: result,
      dbRecordId: savedProposal._id,
    });
  } catch (error) {
    console.error('Proposal analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze proposal', error: error.message });
  }
};

const getProposalStrength = async (req, res) => {
  try {
    const { eventId } = req.params;
    const proposal = await Proposal.findOne({ eventId });

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'No analysis found for this event' });
    }

    res.status(200).json({
      success: true,
      data: {
        score: proposal.strengthScore,
        tips: proposal.strengthTips,
        analyzedAt: proposal.analyzedAt,
        createdAt: proposal.createdAt,
      },
    });
  } catch (error) {
    console.error('Get strength error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve analysis', error: error.message });
  }
};

module.exports = { analyzeProposalStrength, getProposalStrength };
