import React from 'react';
import { Clock } from 'lucide-react';

interface ArrivalTimeProps {
  time: string;
  isDriver: boolean;
  hasPassenger?: boolean;
}

export const ArrivalTime: React.FC<ArrivalTimeProps> = ({
  time,
  isDriver,
  hasPassenger
}) => {
  const getArrivalMessage = () => {
    if (isDriver && hasPassenger) {
      return "Arrivée 10 minutes en avance pour le passager";
    }
    return "Arrivée 10 minutes en avance";
  };

  return (
    <div className="flex items-center space-x-2 text-gray-700">
      <Clock className="w-4 h-4" />
      <span>{getArrivalMessage()} - {time}</span>
    </div>
  );
};