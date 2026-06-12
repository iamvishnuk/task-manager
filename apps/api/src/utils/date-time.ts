import { add } from 'date-fns';

export const calculateExpirationDate = (expiresIn: string = '15m'): Date => {
  // Match number + unit (m = minutes, h = hours, d = days)
  const match = expiresIn.match(/^(\d+)([mhd])$/);
  if (!match) throw new Error('Invalid format. Use "15m", "1h", or "2d".');
  const [, value, unit] = match;
  const expirationDate = new Date();

  // Check the unit and apply accordingly
  switch (unit) {
    case 'm': // minutes
      return add(expirationDate, { minutes: parseInt(value!) });
    case 'h': // hours
      return add(expirationDate, { hours: parseInt(value!) });
    case 'd': // days
      return add(expirationDate, { days: parseInt(value!) });
    default:
      throw new Error('Invalid unit. Use "m", "h", or "d".');
  }
};
