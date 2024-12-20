'use server';

export const getAppVersion = async () => {
  return process.env.NEXT_PUBLIC_APP_VERSION || 'development';
};
