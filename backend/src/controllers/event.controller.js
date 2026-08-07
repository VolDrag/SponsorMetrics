const Event = require('../models/Event');

// @desc    Create a new event (draft or published)
// @route   POST /api/events
// @access  Private (Organizer only)
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizerId: req.user._id,
    };

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: `Event created successfully as ${event.status}`,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message,
    });
  }
};

// @desc    Get all events for logged-in organizer
// @route   GET /api/events/my-events
// @access  Private (Organizer only)
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message,
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:eventId
// @access  Private (Organizer owns it, or any Sponsor if published)
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('organizerId', 'name email organizationName');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Organizer can see their own events regardless of status
    // Sponsors can only see published events
    const isOwner = event.organizerId._id.toString() === req.user._id.toString();
    const isSponsor = req.user.role === 'sponsor';
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin && (!isSponsor || event.status !== 'published')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this event',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message,
    });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:eventId
// @access  Private (Organizer owns it, only if not completed)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      organizerId: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission',
      });
    }

    if (event.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a completed event',
      });
    }

    // Prevent changing organizerId
    delete req.body.organizerId;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message,
    });
  }
};

// @desc    Delete an event (only drafts)
// @route   DELETE /api/events/:eventId
// @access  Private (Organizer owns it)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      organizerId: req.user._id,
      status: 'draft',
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found, or it is not a draft',
      });
    }

    await Event.findByIdAndDelete(req.params.eventId);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message,
    });
  }
};

// @desc    Publish a draft event
// @route   PATCH /api/events/:eventId/publish
// @access  Private (Organizer owns it)
exports.publishEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      organizerId: req.user._id,
      status: 'draft',
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Draft event not found',
      });
    }

    event.status = 'published';
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event published successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to publish event',
      error: error.message,
    });
  }
};

// @desc    Get all published events (for sponsor discovery)
// @route   GET /api/events/discover
// @access  Private (Sponsor only)
exports.getPublishedEvents = async (req, res) => {
  try {
    const {
      search,
      venue,
      minCrowd,
      maxCrowd,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { status: 'published' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    if (venue) {
      filter.venue = { $regex: venue, $options: 'i' };
    }

    if (minCrowd || maxCrowd) {
      filter.expectedCrowdSize = {};
      if (minCrowd) filter.expectedCrowdSize.$gte = parseInt(minCrowd);
      if (maxCrowd) filter.expectedCrowdSize.$lte = parseInt(maxCrowd);
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.find(filter)
      .populate('organizerId', 'name organizationName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message,
    });
  }
};