const EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

export const calculateEffectiveStock = (productStock, reservedData, now) => {
  if (!reservedData) return productStock; // No reservations exist

  let reservedStock = 0;

  for (const orderId in reservedData) {
    const reservation = reservedData[orderId];

    if (!reservation.reservedAt) continue; // Skip if pending server timestamp

    // Safely handle Firestore Timestamp or standard milliseconds
    const reservedTime = reservation.reservedAt.toMillis();

    const isExpired = now - reservedTime > EXPIRY_TIME;

    if (!isExpired) {
      reservedStock += reservation.quantity;
    }
  }

  // Prevent negative stock in UI
  return Math.max(0, productStock - reservedStock);
};
