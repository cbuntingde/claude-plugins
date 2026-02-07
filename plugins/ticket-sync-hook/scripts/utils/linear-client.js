/**
 * Linear API Client
 * Handles communication with Linear API for ticket updates
 */

const axios = require('axios');

class LinearClient {
  constructor(config) {
    if (!config) {
      throw new Error('Linear configuration is required');
    }

    this.apiKey = config.apiKey;
    this.defaultTeam = config.defaultTeam || null;

    if (!this.apiKey) {
      throw new Error('Linear apiKey is required');
    }

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: 'https://api.linear.app/graphql',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        // Remove sensitive data from logs
        const safeConfig = { ...config };
        if (safeConfig.headers?.Authorization) {
          safeConfig.headers.Authorization = 'Bearer ***';
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Execute GraphQL query
   * @param {string} query - GraphQL query
   * @param {Object} variables - Query variables
   * @returns {Promise<Object>} Query response
   * @private
   */
  async _executeQuery(query, variables = {}) {
    try {
      const response = await this.client.post('', {
        query,
        variables
      });

      if (response.data.errors) {
        const errors = response.data.errors.map(e => e.message).join(', ');
        throw new Error(`GraphQL errors: ${errors}`);
      }

      return response.data.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Linear API error: ${error.response.status} - ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Verify ticket exists and is accessible
   * @param {string} ticketId - The Linear ticket ID (e.g., ENG-123)
   * @returns {Promise<boolean>} True if ticket exists
   */
  async verifyTicket(ticketId) {
    if (!ticketId || typeof ticketId !== 'string') {
      return false;
    }

    try {
      const query = `
        query Issue($id: String!) {
          issue(id: $id) {
            id
            identifier
          }
        }
      `;

      const data = await this._executeQuery(query, { id: ticketId });
      return !!data.issue;
    } catch (error) {
      if (error.message.includes('Issue could not be found')) {
        return false;
      }
      throw new Error(`Failed to verify ticket ${ticketId}: ${error.message}`);
    }
  }

  /**
   * Add comment to a Linear ticket
   * @param {string} ticketId - The Linear ticket ID
   * @param {string} body - Comment body text
   * @returns {Promise<Object>} Response from Linear API
   */
  async addComment(ticketId, body) {
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('Valid ticketId is required');
    }

    if (!body || typeof body !== 'string') {
      throw new Error('Comment body is required');
    }

    try {
      const mutation = `
        mutation CreateComment($issueId: String!, $body: String!) {
          commentCreate(input: {
            issueId: $issueId,
            body: $body
          }) {
            success
            comment {
              id
              body
              url
            }
          }
        }
      `;

      const data = await this._executeQuery(mutation, {
        issueId: ticketId,
        body
      });

      return {
        success: data.commentCreate.success,
        id: data.commentCreate.comment.id,
        url: data.commentCreate.comment.url
      };
    } catch (error) {
      throw new Error(`Failed to add comment to ${ticketId}: ${error.message}`);
    }
  }

  /**
   * Update ticket status
   * @param {string} ticketId - The Linear ticket ID
   * @param {string} statusName - The new status name
   * @returns {Promise<Object>} Response from Linear API
   */
  async updateStatus(ticketId, statusName) {
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('Valid ticketId is required');
    }

    if (!statusName || typeof statusName !== 'string') {
      throw new Error('Status name is required');
    }

    try {
      // First, get the ticket's current status and available states
      const query = `
        query IssueData($id: String!) {
          issue(id: $id) {
            id
            identifier
            state {
              id
              name
            }
            team {
              states {
                nodes {
                  id
                  name
                  type
                }
              }
            }
          }
        }
      `;

      const data = await this._executeQuery(query, { id: ticketId });
      const issue = data.issue;

      if (!issue) {
        throw new Error(`Ticket ${ticketId} not found`);
      }

      const currentStatus = issue.state.name;

      if (currentStatus === statusName) {
        return {
          success: true,
          message: `Ticket already in status: ${statusName}`,
          currentStatus
        };
      }

      // Find the target state
      const targetState = issue.team.states.nodes.find(
        state => state.name.toLowerCase() === statusName.toLowerCase()
      );

      if (!targetState) {
        const availableStates = issue.team.states.nodes.map(s => s.name);
        return {
          success: false,
          message: `Status "${statusName}" not available. Current status: ${currentStatus}`,
          currentStatus,
          availableStatuses
        };
      }

      // Update the ticket state
      const mutation = `
        mutation UpdateIssue($issueId: String!, $stateId: String!) {
          issueUpdate(input: {
            id: $issueId,
            stateId: $stateId
          }) {
            success
            issue {
              id
              identifier
              state {
                id
                name
              }
            }
          }
        }
      `;

      const updateData = await this._executeQuery(mutation, {
        issueId: ticketId,
        stateId: targetState.id
      });

      return {
        success: updateData.issueUpdate.success,
        previousStatus: currentStatus,
        newStatus: updateData.issueUpdate.issue.state.name
      };
    } catch (error) {
      throw new Error(`Failed to update status for ${ticketId}: ${error.message}`);
    }
  }

  /**
   * Get ticket details
   * @param {string} ticketId - The Linear ticket ID
   * @returns {Promise<Object>} Ticket details
   */
  async getTicket(ticketId) {
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('Valid ticketId is required');
    }

    try {
      const query = `
        query Issue($id: String!) {
          issue(id: $id) {
            id
            identifier
            title
            state {
              id
              name
            }
            assignee {
              name
            }
            url
          }
        }
      `;

      const data = await this._executeQuery(query, { id: ticketId });

      if (!data.issue) {
        throw new Error(`Ticket ${ticketId} not found`);
      }

      return {
        id: data.issue.identifier,
        title: data.issue.title,
        status: data.issue.state.name,
        assignee: data.issue.assignee?.name || 'Unassigned',
        url: data.issue.url
      };
    } catch (error) {
      throw new Error(`Failed to get ticket ${ticketId}: ${error.message}`);
    }
  }

  /**
   * Update ticket with comment and optionally change status
   * @param {string} ticketId - The Linear ticket ID
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
        results.commentResult = await this.addComment(ticketId, updateData.comment);
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

module.exports = LinearClient;
