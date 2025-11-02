// src/routes/notification.routes.js
import { Router } from 'express';
import {
  getNotifications,
  markNotificationsAsRead,
} from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/v1/notifications
 * @desc    Get all notifications for logged-in user
 * @access  Private
 */
router.get('/', authenticateUser, getNotifications);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:id/read', authenticateUser, markNotificationsAsRead);

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', authenticateUser, markNotificationsAsRead);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:id/read', authenticateUser, markNotificationsAsRead);

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', authenticateUser, markNotificationsAsRead);

export default router;
