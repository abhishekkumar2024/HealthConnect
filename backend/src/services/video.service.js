// src/services/video.service.js
import crypto from 'crypto';
import logger from '../utils/logger.utils.js';
import ApiErrors from '../utils/ApiError.utils.js';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.utils.js';

class VideoService {
  constructor() {
    this.jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  /**
   * Create Jitsi Meet video session
   * @param {Object} params - Session parameters
   * @returns {Promise<Object>} Video session details
   */
  async createSession({ appointmentId, doctorId, patientId, scheduledTime }) {
    try {
      logger.info('Creating Jitsi Meet video session', { appointmentId });

      // Generate unique room name
      const roomName = this._generateRoomName(appointmentId);
      const sessionId = crypto.randomBytes(16).toString('hex');

      // Generate secure tokens for authentication (optional)
      const patientToken = this._generateToken(patientId, roomName, 'patient');
      const doctorToken = this._generateToken(doctorId, roomName, 'doctor');

      // Create Jitsi Meet URLs
      const patientJitsiUrl = this._buildJitsiUrl(roomName, {
        displayName: 'Patient',
        email: `patient_${patientId}@healthcare.app`,
        userInfo: { role: 'patient' },
      });

      const doctorJitsiUrl = this._buildJitsiUrl(roomName, {
        displayName: 'Doctor',
        email: `doctor_${doctorId}@healthcare.app`,
        userInfo: { role: 'doctor' },
      });

      const session = {
        sessionId,
        roomId: roomName,
        provider: 'jitsi',
        
        // Frontend embed links
        patientLink: `${this.frontendUrl}/video/patient/${sessionId}?token=${patientToken}`,
        doctorLink: `${this.frontendUrl}/video/doctor/${sessionId}?token=${doctorToken}`,
        
        // Direct Jitsi URLs (can be used for redirect)
        patientJitsiUrl,
        doctorJitsiUrl,
        
        // Tokens for validation
        patientToken,
        doctorToken,
        
        // Room details
        jitsiDomain: this.jitsiDomain,
        roomName,
        
        // Expiration
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        scheduledTime,
      };

      logger.info('Jitsi Meet session created', {
        sessionId,
        roomName,
      });

      return session;
    } catch (error) {
      logger.error('Failed to create Jitsi Meet session', {
        error: error.message,
        stack: error.stack,
      });

      throw new ApiErrors(
        `Failed to create video session: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.VIDEO_SESSION_FAILED
      );
    }
  }

  /**
   * Generate unique room name
   * @private
   */
  _generateRoomName(appointmentId) {
    const randomStr = crypto.randomBytes(8).toString('hex');
    return `healthcare_${appointmentId}_${randomStr}`;
  }

  /**
   * Build Jitsi Meet URL with query parameters
   * @private
   */
  _buildJitsiUrl(roomName, config = {}) {
    const params = new URLSearchParams();

    if (config.displayName) {
      params.append('displayName', config.displayName);
    }

    if (config.email) {
      params.append('email', config.email);
    }

    if (config.userInfo) {
      params.append('userInfo', JSON.stringify(config.userInfo));
    }

    const queryString = params.toString();
    return `https://${this.jitsiDomain}/${roomName}${queryString ? '?' + queryString : ''}`;
  }

  /**
   * Generate token for session validation
   * @private
   */
  _generateToken(userId, roomName, role) {
    const payload = JSON.stringify({
      userId,
      roomName,
      role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return crypto
      .createHmac('sha256', process.env.VIDEO_SECRET || 'default-secret')
      .update(payload)
      .digest('hex');
  }

  /**
   * Validate session token
   */
  validateToken(token, roomName) {
    try {
      // Implement your validation logic
      return true;
    } catch (error) {
      logger.error('Token validation failed', { error: error.message });
      return false;
    }
  }

  /**
   * End video session (cleanup if needed)
   */
  async endSession(sessionId) {
    logger.info('Ending Jitsi Meet session', { sessionId });

    return {
      success: true,
      sessionId,
      endedAt: new Date(),
    };
  }
}

export default new VideoService();
