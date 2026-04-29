/**
 * Shared in-memory state for room management.
 * These objects persist across socket connections for the lifetime of the server.
 */

// Map<roomCode, Array<{ uid, socketId, name, role }>>
export const roomUsers = {};

// Map<roomCode, Array<drawAction>>
export const roomBoards = {};

// Map<roomCode, Map<uid, role>>
export const userRoles = {};
