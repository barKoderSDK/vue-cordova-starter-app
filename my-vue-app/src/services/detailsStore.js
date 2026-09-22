// Vue Router has no React-Router-style location state, so the item being opened
// on the details screen is handed over through this module-level slot.
let pendingDetails = null;

export const setDetailsItem = (payload) => {
  pendingDetails = payload;
};

export const consumeDetailsItem = () => {
  const payload = pendingDetails;
  pendingDetails = null;
  return payload;
};
