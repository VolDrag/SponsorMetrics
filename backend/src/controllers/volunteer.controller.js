const Volunteer = require('../models/Volunteer');
const VolunteerEmailLog = require('../models/VolunteerEmailLog');
const Event = require('../models/Event');
const { sendVolunteerInstructions } = require('../services/email.service');

// ===== MODULE 4 FEATURE 1: Volunteer Management System — START =====
const findOwnedEvent = async (eventId, organizerId) =>
  Event.findOne({ _id: eventId, organizerId });

// @desc    List volunteers for an event
// @route   GET /api/volunteers/event/:eventId
// @access  Private (Organizer owner)
exports.listVolunteers = async (req, res) => {
  try {
    const event = await findOwnedEvent(req.params.eventId, req.user._id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or you do not have permission' });
    }

    const volunteers = await Volunteer.find({ eventId: event._id }).sort({ role: 1, shiftTime: 1, name: 1 });
    const logs = await VolunteerEmailLog.find({ eventId: event._id }).sort({ sentAt: -1 }).limit(20);

    res.status(200).json({
      success: true,
      count: volunteers.length,
      data: { event, volunteers, emailLogs: logs },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch volunteers', error: error.message });
  }
};

// @desc    Add a volunteer to the event roster
// @route   POST /api/volunteers/event/:eventId
// @access  Private (Organizer owner)
exports.createVolunteer = async (req, res) => {
  try {
    const event = await findOwnedEvent(req.params.eventId, req.user._id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or you do not have permission' });
    }

    const volunteer = await Volunteer.create({
      eventId: event._id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || '',
      role: req.body.role || 'General',
      shiftTime: req.body.shiftTime || '',
      notes: req.body.notes || '',
      source: 'organizer',
    });

    res.status(201).json({ success: true, message: 'Volunteer added', data: volunteer });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'That email is already on this roster' });
    }
    res.status(500).json({ success: false, message: 'Failed to add volunteer', error: error.message });
  }
};

// @desc    Update volunteer details
// @route   PUT /api/volunteers/:volunteerId
// @access  Private (Organizer owner)
exports.updateVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    const event = await findOwnedEvent(volunteer.eventId, req.user._id);
    if (!event) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this volunteer' });
    }

    ['name', 'email', 'phone', 'role', 'shiftTime', 'notes', 'checkedIn'].forEach((field) => {
      if (req.body[field] !== undefined) volunteer[field] = req.body[field];
    });
    await volunteer.save();

    res.status(200).json({ success: true, message: 'Volunteer updated', data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update volunteer', error: error.message });
  }
};

// @desc    Toggle event-day check-in
// @route   PATCH /api/volunteers/:volunteerId/check-in
// @access  Private (Organizer owner)
exports.toggleCheckIn = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    const event = await findOwnedEvent(volunteer.eventId, req.user._id);
    if (!event) {
      return res.status(403).json({ success: false, message: 'You do not have permission' });
    }

    volunteer.checkedIn = req.body.checkedIn !== undefined ? Boolean(req.body.checkedIn) : !volunteer.checkedIn;
    await volunteer.save();

    res.status(200).json({ success: true, message: volunteer.checkedIn ? 'Checked in' : 'Check-in cleared', data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update check-in', error: error.message });
  }
};

exports.deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    const event = await findOwnedEvent(volunteer.eventId, req.user._id);
    if (!event) {
      return res.status(403).json({ success: false, message: 'You do not have permission' });
    }
    await volunteer.deleteOne();
    res.status(200).json({ success: true, message: 'Volunteer removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove volunteer', error: error.message });
  }
};

// @desc    Email selected volunteers (or a role filter, or everyone)
// @route   POST /api/volunteers/event/:eventId/email
// @access  Private (Organizer owner)
exports.emailVolunteers = async (req, res) => {
  try {
    const event = await findOwnedEvent(req.params.eventId, req.user._id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or you do not have permission' });
    }

    const query = { eventId: event._id };
    if (req.body.role) query.role = req.body.role;
    if (Array.isArray(req.body.volunteerIds) && req.body.volunteerIds.length) {
      query._id = { $in: req.body.volunteerIds };
    }

    const recipients = await Volunteer.find(query);
    if (!recipients.length) {
      return res.status(400).json({ success: false, message: 'No volunteers match that selection' });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2337;">${event.name}</h2>
        <p>${String(req.body.body).replace(/\n/g, '<br/>')}</p>
      </div>
    `;

    for (const volunteer of recipients) {
      await sendVolunteerInstructions(volunteer.email, req.body.subject, html);
    }

    const log = await VolunteerEmailLog.create({
      eventId: event._id,
      organizerId: req.user._id,
      subject: req.body.subject,
      body: req.body.body,
      recipientEmails: recipients.map((row) => row.email),
      recipientCount: recipients.length,
      sentAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Instructions sent to ${recipients.length} volunteer(s)`,
      data: log,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send volunteer emails', error: error.message });
  }
};

// Stretch: public no-login self-signup into the same roster
exports.publicEventInfo = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).select('name venue date');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load event', error: error.message });
  }
};

exports.publicSignup = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const volunteer = await Volunteer.create({
      eventId: event._id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || '',
      role: req.body.role || 'General',
      shiftTime: req.body.shiftTime || '',
      notes: req.body.notes || '',
      source: 'self_signup',
    });

    res.status(201).json({ success: true, message: 'You are on the volunteer roster', data: volunteer });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'That email is already registered for this event' });
    }
    res.status(500).json({ success: false, message: 'Failed to sign up', error: error.message });
  }
};
// ===== MODULE 4 FEATURE 1: Volunteer Management System — END =====
