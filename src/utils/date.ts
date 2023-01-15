import dayjs from 'dayjs';

export const formatDate = (date: string) => {};

export const getTimeAgo = (minutes: number, unit: dayjs.ManipulateType): number => {
  const date = dayjs().subtract(minutes, unit).valueOf();
  return date;
};
