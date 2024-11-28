export const parseTime = (time: string): number => {
  if (!time || typeof time !== 'string') return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const formatTime = (minutes: number): string => {
  if (typeof minutes !== 'number' || isNaN(minutes)) return '00:00';
  const normalizedMinutes = Math.max(0, Math.min(minutes, 24 * 60 - 1)); // Clamp between 0 and 23:59
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const calculateAdjustedTime = (
  baseTime: string,
  detourMinutes: number,
  timeOfDay: 'morning' | 'evening'
): string => {
  try {
    const baseMinutes = parseTime(baseTime);
    if (baseMinutes === 0) throw new Error('Invalid base time');
    
    const adjustedMinutes = timeOfDay === 'morning'
      ? baseMinutes + detourMinutes
      : baseMinutes - detourMinutes;
      
    return formatTime(adjustedMinutes);
  } catch (error) {
    console.error('Error calculating adjusted time:', error);
    return baseTime; // Return original time if calculation fails
  }
};

export const isTimeCompatible = (
  desiredTime: string,
  adjustedTime: string,
  timeOfDay: 'morning' | 'evening'
): boolean => {
  try {
    const desired = parseTime(desiredTime);
    const adjusted = parseTime(adjustedTime);
    if (desired === 0 || adjusted === 0) return false;

    const diff = adjusted - desired;

    if (timeOfDay === 'morning') {
      // For morning: -30 min early to +10 min late
      return diff >= -30 && diff <= 10;
    } else {
      // For evening: -10 min early to +30 min late
      return diff >= -10 && diff <= 30;
    }
  } catch (error) {
    console.error('Error checking time compatibility:', error);
    return false;
  }
};