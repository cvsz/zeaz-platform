/**
 * @file chatPersistence.js
 * @description Chat message persistence using localStorage.
 *
 * Stores up to MAX_STORED messages. Handles Date serialization/deserialization.
 * All errors are caught and logged as warnings (never throws to callers).
 */

const STORAGE_KEY = 'omega_chat_messages';

function getMaxStored() {
  return parseInt(process.env.REACT_APP_MAX_MESSAGES, 10) || 100;
}

export const persistChat = {
  /**
   * Save messages to localStorage. Truncates to MAX_STORED newest messages.
   * @param {Array<object>} messages
   */
  save(messages) {
    try {
      const toStore = messages.slice(-getMaxStored());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('[OMEGA-CHAT][PERSIST][WARN] Failed to save messages:', e?.message);
    }
  },

  /**
   * Load messages from localStorage. Restores Date objects for timestamp fields.
   * Returns empty array on any error.
   * @returns {Array<object>}
   */
  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const messages = JSON.parse(stored);
      if (!Array.isArray(messages)) return [];
      return messages.map((m) => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      }));
    } catch (e) {
      console.warn('[OMEGA-CHAT][PERSIST][WARN] Failed to load messages:', e?.message);
      return [];
    }
  },

  /**
   * Clear all persisted messages from localStorage.
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[OMEGA-CHAT][PERSIST][WARN] Failed to clear messages:', e?.message);
    }
  },
};

export default persistChat;
