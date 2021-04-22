import dayjs from 'dayjs';
import { EventData } from 'types';

export const isEventLive = (event: EventData): boolean => {
  const currentTime = Date.now();

  return (
    dayjs(currentTime).isAfter(dayjs(event.startTime)) &&
    dayjs(currentTime).isBefore(dayjs(event.endTime))
  );
};
