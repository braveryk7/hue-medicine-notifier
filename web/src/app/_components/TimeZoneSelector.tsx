import moment from 'moment-timezone';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';

type TimeZoneSelectorProps = {
  selectedTimeZoneOffset: {
    timeZone: string;
    offSet: number;
  };
  setSelectedTimeZoneOffset: Dispatch<
    SetStateAction<{
      timeZone: string;
      offSet: number;
    }>
  >;
};

export const TimeZoneSelector = ({ selectedTimeZoneOffset, setSelectedTimeZoneOffset }: TimeZoneSelectorProps) => {
  const timezones = moment.tz.names();

  const options = timezones.map((timezone) => {
    const offset = moment.tz(timezone).utcOffset();
    const offsetHours = Math.floor(offset / 60);
    const offsetMinutes = offset % 60;
    const formattedOffset = `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}:${offsetMinutes
      .toString()
      .padStart(2, '0')}`;

    return {
      timezone,
      formattedOffset,
    };
  });

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedTimeZone = e.target.value;
    const offset = moment.tz(selectedTimeZone).utcOffset();
    setSelectedTimeZoneOffset({
      timeZone: selectedTimeZone,
      offSet: offset,
    });
  };

  return (
    <div>
      <label htmlFor="light">タイムゾーン</label>
      <select className="col-span-6 rounded border p-2" onChange={handleChange} value={selectedTimeZoneOffset.timeZone}>
        {options.map(({ timezone, formattedOffset }) => (
          <option key={timezone} value={timezone}>
            {timezone} ({formattedOffset})
          </option>
        ))}
      </select>
    </div>
  );
};
