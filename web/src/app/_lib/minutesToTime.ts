export const minutesToTime = (minutes: number, utcOffset: number) => {
  const offsetMinutes = minutes + utcOffset;
  const hours = Math.floor(offsetMinutes / 60);
  const mins = offsetMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};
