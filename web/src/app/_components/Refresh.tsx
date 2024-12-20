'use client';

import { useEffect } from 'react';
import { getAppVersion } from '../_actions/getAppVersion';
import { useRouter } from 'next/navigation';

export const Refresh = () => {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const serverVersion = await getAppVersion();
      const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;

      if (serverVersion !== currentVersion) {
        router.refresh();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [router]);

  return null;
};
