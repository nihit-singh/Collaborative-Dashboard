/**
 * Generates a consistent, pleasant color for a given user ID.
 */
export const getUserColor = (id) => {
  if (!id) return "#4CAF50";
  
  const colors = [
    "#4CAF50", "#2196F3", "#9C27B0", "#F44336", 
    "#FF9800", "#795548", "#00BCD4", "#673AB7",
    "#E91E63", "#3F51B5", "#009688", "#FFC107"
  ];
  
  // Simple hash of the string
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
