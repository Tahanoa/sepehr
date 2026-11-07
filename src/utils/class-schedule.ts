import { ClassSchedule, WeekDay } from '../types/school';

export const weekdayLabels: Record<WeekDay, string> = {
  saturday: 'شنبه',
  sunday: 'یکشنبه',
  monday: 'دوشنبه',
  tuesday: 'سه‌شنبه',
  wednesday: 'چهارشنبه',
  thursday: 'پنج‌شنبه',
  friday: 'جمعه',
};

export function timeMinutes(value: string): number {
  const normalized = value.trim()
    .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
  if (!/^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(normalized)) return NaN;
  const [hour = 0, minute = 0] = normalized.split(':').map(Number);
  return hour * 60 + minute;
}

export function timesOverlap(start: string, end: string, otherStart: string, otherEnd: string): boolean {
  return timeMinutes(start) < timeMinutes(otherEnd) && timeMinutes(otherStart) < timeMinutes(end);
}

export function formatClassSchedule(schedule: ClassSchedule): string {
  return schedule.days.map(day => weekdayLabels[day]).join('، ') +
    ' · ' + schedule.startTime + ' تا ' + schedule.endTime;
}
