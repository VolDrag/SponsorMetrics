const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

router.get('/', authenticate, notificationController.list);
router.post('/read', authenticate, notificationController.markRead);

module.exports = router;
