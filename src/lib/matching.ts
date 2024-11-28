import { mapsService } from './maps/service';
import { calculateAdjustedTime, isTimeCompatible } from './time';
import { LatLngLiteral } from '@react-google-maps/api';

interface WorkDay {
  enabled: boolean;
  arrivalTime: string;
  departureTime: string;
}

interface WorkSchedule {
  monday: WorkDay;
  tuesday: WorkDay;
  wednesday: WorkDay;
  thursday: WorkDay;
  friday: WorkDay;
  saturday: WorkDay;
}

interface UserProfile {
  homeCoords: LatLngLiteral;
  workCoords: LatLngLiteral;
  schedule: WorkSchedule;
}

export const calculateMatchDetails = async (
  driver: UserProfile,
  passenger: UserProfile,
  selectedDay: keyof WorkSchedule,
  timeOfDay: 'morning' | 'evening'
): Promise<{
  detourMinutes: number;
  route: LatLngLiteral[];
  adjustedTime: string;
  isCompatible: boolean;
  passengerDetourMinutes: number;
}> => {
  try {
    // Validate schedule
    const driverSchedule = driver.schedule[selectedDay];
    const passengerSchedule = passenger.schedule[selectedDay];
    
    if (!driverSchedule?.enabled || !passengerSchedule?.enabled) {
      throw new Error('Schedule not enabled');
    }

    const baseTime = timeOfDay === 'morning' ? driverSchedule.arrivalTime : driverSchedule.departureTime;
    const desiredTime = timeOfDay === 'morning' ? passengerSchedule.arrivalTime : passengerSchedule.departureTime;

    if (!baseTime || !desiredTime) {
      throw new Error('Invalid times');
    }

    // Calculate routes
    const [driverDirectRoute, passengerDirectRoute, detourRoute] = await Promise.all([
      mapsService.calculateDirectRoute(
        timeOfDay === 'morning' ? driver.homeCoords : driver.workCoords,
        timeOfDay === 'morning' ? driver.workCoords : driver.homeCoords
      ),
      mapsService.calculateDirectRoute(
        timeOfDay === 'morning' ? passenger.homeCoords : passenger.workCoords,
        timeOfDay === 'morning' ? passenger.workCoords : passenger.homeCoords
      ),
      mapsService.calculateMatchRoute(
        timeOfDay === 'morning' ? driver.homeCoords : driver.workCoords,
        timeOfDay === 'morning' ? driver.workCoords : driver.homeCoords,
        timeOfDay === 'morning' ? passenger.homeCoords : passenger.workCoords,
        timeOfDay === 'morning' ? passenger.workCoords : passenger.homeCoords
      )
    ]);

    // Parse durations
    const driverDirectDuration = parseInt(driverDirectRoute.duration);
    const passengerDirectDuration = parseInt(passengerDirectRoute.duration);
    const detourDuration = parseInt(detourRoute.duration);

    if (isNaN(driverDirectDuration) || isNaN(passengerDirectDuration) || isNaN(detourDuration)) {
      throw new Error('Invalid duration values');
    }

    const detourMinutes = detourDuration - driverDirectDuration;
    const passengerDetourMinutes = detourDuration - passengerDirectDuration;

    // Calculate adjusted time
    const adjustedTime = calculateAdjustedTime(baseTime, detourMinutes, timeOfDay);
    const isCompatible = isTimeCompatible(desiredTime, adjustedTime, timeOfDay);

    return {
      detourMinutes,
      route: detourRoute.route,
      adjustedTime,
      isCompatible,
      passengerDetourMinutes
    };
  } catch (error) {
    console.error('Error in calculateMatchDetails:', error);
    throw new Error('Failed to calculate match details');
  }
};