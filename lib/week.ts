export const mealLabels = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐" } as const;
export type MealType = keyof typeof mealLabels;
export const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d;
}

export function weekDays(date = new Date()) {
  const start = startOfWeek(date);
  return weekdays.map((label, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return { label, date: d, timestamp: d.getTime() };
  });
}
