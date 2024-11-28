export const calculateEarnings = (
  passengerJourneyDistanceKm: number,
  detourMinutes: number
): number => {
  return (0.063 * passengerJourneyDistanceKm) / 2 + 0.2 * detourMinutes;
};

export const calculatePayment = (
  passengerJourneyDistanceKm: number,
  detourMinutes: number
): number => {
  return (0.063 * passengerJourneyDistanceKm) / 2 + 0.2 * detourMinutes;
};