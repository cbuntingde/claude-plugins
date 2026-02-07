/**
 * Jira API Client
 * Handles communication with Jira API for ticket updates
 */

const axios = require('axios');

class JiraClient {
  constructor(config) {
    if (!config) {
      throw new Error('Jira configuration is required');
    }

    this.baseUrl = config.baseUrl;
    this.email = config.email;
    this.apiToken = config.apiToken;
    this.defaultProject = config.defaultProject || null;

    if (!this.baseUrl) {
      throw new Error('Jira baseUrl is required');
    }
    if (!this.email) {
      throw new Error('Jira email is required');
    }
    if (!this.apiToken) {
      throw new Error('Jira apiToken is required');
    }

    // Remove trailing slash from baseUrl
    this.baseUrl = this.baseUrl.replace(/\/$/, '');

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: `${this.baseUrl}/rest/api/3`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      auth: {
        username: this.email,
        password: this.apiToken
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        // Remove sensitive data from logs
        const safeConfig = { ...config };
        if (safeConfig.auth) {
          safeConfig.auth = { username: '***', password: '***' };
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Verify ticket exists and is accessible
   * @param {string} ticketId - The Jira ticket ID (e.g., PROJ-123)
   * @returns {Promise<boolean>} True if ticket exists
   */
  async verifyTicket(ticketId) {
    if (!ticketId || typeof ticketId !== 'string') {
      return false;
    }

    try {
      const response = await this.client.get(`/issue/${ticketId}`);
      return response.status === 200;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw new Error(`Failed to verify ticket ${ticketId}: ${error.message}`);
    }
  }

  /**
   * Add comment to a Jira ticket
   * @param {string} ticketId - The Jira ticket ID
   * @param {Object} commentData - Comment data with body and metadata
   * @returns {Promise<Object>} Response from Jira API
   */
  async addComment(ticketId, commentData) {
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('Valid ticketId is required');
    }

    if (!commentData || !commentData.body) {
      throw new Error('Comment body is required');
    }

    try {
      const commentPayload = {
        body: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: commentData.body
                }
              ]
            }
          ]
        }
      };

      const response = await this.client.post(
        `/issue/${ticketId}/comment`,
        commentPayload
      );

      return {
        success: true,
        id: response.data.id,
        self: response.data.self
      };
    } catch (error) {
      throw new Error(`Failed to add comment to ${ticketId}: ${error.message}`);
    }
  }

  /**
   * Update ticket status
   * @param {string} ticketId - The Jira ticket ID
   * @param {string} status - The new status name
   * @returns {Promise<Object>} Response from Jira API
   */
  async updateStatus(ticketId, status) {
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('Valid ticketId is required');
    }

    if (!status || typeof status !== 'string') {
      throw new Error('Status is required');
    }

    try {
      // First, get the ticket to find valid transitions
      const issueResponse = await this.client.get(`/issue/${ticketId}`);
      const currentStatus = issueResponse.data.fields.status.name;

      if (currentStatus === status) {
        return {
          success: true,
          message: `Ticket already in status: ${status}`,
          currentStatus
        };
      }

      // Get available transitions
      const transitionsResponse = await this.client.get(
        `/issue/${ticketId}/transitions`
      );

      // Find the transition ID for the desired status
      const transition = transitionsResponse.data.transitions.find(
        t => t.to.name.toLowerCase() === status.toLowerCase()
      );

      if (!transition) {
        return {
          success: false,
          message: `Status "${status}" not available. Current status: ${currentStatus}`,
          currentStatus,
          availableStatuses: transitionsResponse.data.transitions.map(t => t.to.name)
        };
      }

      // Execute the transition
      await this.client.post(`/issue/${ticketId}/transitions`, {
        transition: {
          id: transition.id
        }
      });

      return {
        success: true,
        previousStatus: currentStatus,
        newStatus: status
      };
    } catch (error) {
      throw new Error(`Failed to update status for ${ticketId}: ${error.message}`);
    }
  }

  /**
   * Get ticket details
   * @param {string} ticketId - The Jira ticket ID
   * @returns {Promise<Object>} Ticket details
   */
  async getTicket(ticketId) {
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('Valid ticketId is required');
    }

    try {
      const response = await this.client.get(`/issue/${ticketId}`);

      return {
        id: response.data.key,
        summary: response.data.fields.summary,
        status: response.data.fields.status.name,
        assignee: response.data.fields.assignee?.displayName || 'Unassigned',
        url: `${this.baseUrl}/browse/${ticketId}`
      };
    } catch (error) {
      throw new Error(`Failed to get ticket ${ticketId}: ${error.message}`);
    }
  }

  /**
   * Update ticket with comment and optionally change status
   * @param {string} ticketId - The Jira ticket ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Combined result
   */
  async updateTicket(ticketId, updateData) {
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('Valid ticketId is required');
    }

    const results = {
      ticketId,
      commentResult: null,
      statusResult: null,
      errors: []
    };

    // Add comment if provided
    if (updateData.comment) {
      try {
        results.commentResult = await this.addComment(ticketId, {
          body: updateData.comment
        });
      } catch (error) {
        results.errors.push(`Comment failed: ${error.message}`);
      }
    }

    // Update status if provided and different from current
    if (updateData.status) {
      try {
        results.statusResult = await this.updateStatus(ticketId, updateData.status);
      } catch (error) {
        results.errors.push(`Status update failed: ${error.message}`);
      }
    }

    results.success = results.errors.length === 0;
    return results;
  }
}

module.exports = JiraClient;
