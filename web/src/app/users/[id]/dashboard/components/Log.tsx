'use client';

import { Task } from '@prisma/client';
import { useEffect, useState } from 'react';
import { fetchLogs } from '../_actions/actions';

export const Log = ({ userId }: { userId: number }) => {
  const [log, setLog] = useState<Task[]>([]);

  useEffect(() => {
    const logList = async () => {
      try {
        const logs = await fetchLogs(userId);
        setLog(logs);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    logList();
  }, [userId]);

  console.log(log);

  return <></>;
};
