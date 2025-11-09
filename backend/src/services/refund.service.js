// src/services/refund.service.js
import { REFUND_POLICY } from '../utils/constants.utils.js';
import logger from '../utils/logger.utils.js';

class RefundService {
  /**
   * Calculate refund amount based on cancellation policy
   */
  calculateRefundAmount(originalAmount, hoursUntilAppointment) {
    let refundPercentage = 0;
    let message = '';

    if (hoursUntilAppointment >= REFUND_POLICY.HOURS_48_PLUS.hours) {
      refundPercentage = REFUND_POLICY.HOURS_48_PLUS.percentage;
      message = 'Full refund - cancelled 48+ hours in advance';
    } else if (hoursUntilAppointment >= REFUND_POLICY.HOURS_24_TO_48.hours) {
      refundPercentage = REFUND_POLICY.HOURS_24_TO_48.percentage;
      message = '75% refund - cancelled 24-48 hours in advance';
    } else if (hoursUntilAppointment >= REFUND_POLICY.HOURS_12_TO_24.hours) {
      refundPercentage = REFUND_POLICY.HOURS_12_TO_24.percentage;
      message = '50% refund - cancelled 12-24 hours in advance';
    } else if (hoursUntilAppointment >= REFUND_POLICY.HOURS_0_TO_12.hours) {
      refundPercentage = REFUND_POLICY.HOURS_0_TO_12.percentage;
      message = '25% refund - cancelled less than 12 hours in advance';
    } else {
      refundPercentage = 0;
      message = 'No refund - appointment time has passed';
    }

    const refundAmount = (originalAmount * refundPercentage) / 100;

    logger.info('Refund calculated', {
      originalAmount,
      refundAmount,
      refundPercentage,
      hoursUntilAppointment,
    });

    return {
      refundAmount,
      refundPercentage: `${refundPercentage}%`,
      message,
      hoursUntilAppointment: Math.max(0, hoursUntilAppointment),
    };
  }

  /**
   * Get hours until appointment  
   */
  getHoursUntilAppointment(appointmentDate) {
    const now = new Date();
    const appointment = new Date(appointmentDate);
    return (appointment - now) / (1000 * 60 * 60);
  }
}

export default new RefundService();
