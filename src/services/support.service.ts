import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { Complaint } from '../types';

export class SupportService {
  constructor(private db: Database) {}

  async raiseComplaint(
    userId: string,
    subject: string,
    description: string,
    category: 'transaction' | 'card' | 'loan' | 'account' | 'general',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<{ success: boolean; complaintId?: string; message: string }> {
    try {
      const complaintId = uuidv4();

      const complaint: Omit<Complaint, 'createdAt' | 'updatedAt'> = {
        id: complaintId,
        userId,
        subject,
        description,
        category,
        priority,
        status: 'open'
      };

      await this.db.createComplaint(complaint);

      return {
        success: true,
        complaintId,
        message: `Complaint raised successfully. Your complaint ID is ${complaintId}. We will respond within 24-48 hours.`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to raise complaint'
      };
    }
  }

  async trackComplaint(complaintId: string, userId: string): Promise<{ success: boolean; complaint?: Complaint; message: string }> {
    try {
      const complaint = await this.db.getComplaintById(complaintId);
      if (!complaint) {
        return { success: false, message: 'Complaint not found' };
      }

      if (complaint.userId !== userId) {
        return { success: false, message: 'Unauthorized to view this complaint' };
      }

      return {
        success: true,
        complaint,
        message: 'Complaint details retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve complaint details'
      };
    }
  }

  async getUserComplaints(userId: string): Promise<Complaint[]> {
    return await this.db.getComplaintsByUserId(userId);
  }
}
