/**
 * 解析cron字段（支持 * , - / 语法）
 * @param field cron字段字符串
 * @param min 允许的最小值
 * @param max 允许的最大值
 * @returns 该字段允许的数值数组（已排序）
 */
function parseCronField(field: string, min: number, max: number): number[] {
  // 处理逗号分隔的多部分
  const parts = field.split(',');
  const values = new Set<number>();

  for (const part of parts) {
    // 处理步长语法 (e.g., */5, 1-30/2)
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) {
        throw new Error(`Invalid step value: ${stepStr}`);
      }

      let start: number, end: number;
      if (range === '*') {
        start = min;
        end = max;
      } else if (range.includes('-')) {
        [start, end] = range.split('-').map(Number);
      } else {
        start = Number(range);
        end = max;
      }

      if (start < min || end > max || start > end) {
        throw new Error(`Range ${start}-${end} out of bounds [${min},${max}]`);
      }

      for (let i = start; i <= end; i += step) {
        values.add(i);
      }
    }
    // 处理范围语法 (e.g., 1-5)
    else if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (start < min || end > max || start > end) {
        throw new Error(`Range ${start}-${end} out of bounds [${min},${max}]`);
      }
      for (let i = start; i <= end; i++) {
        values.add(i);
      }
    }
    // 处理通配符 (*)
    else if (part === '*') {
      for (let i = min; i <= max; i++) {
        values.add(i);
      }
    }
    // 处理单个数字
    else {
      const value = parseInt(part, 10);
      if (isNaN(value) || value < min || value > max) {
        throw new Error(`Value ${value} out of range [${min},${max}]`);
      }
      values.add(value);
    }
  }

  // 转换为排序后的数组
  return Array.from(values).sort((a, b) => a - b);
}

/**
 * 解析cron表达式（6个字段：秒 分 时 日 月 周）
 * @param cron cron表达式字符串
 * @returns 解析后的各字段数值数组
 */
function parseCron(cron: string) {
  const fields = cron.trim().split(/\s+/);
  if (fields.length !== 6) {
    throw new Error('Invalid cron format: must have 6 fields');
  }

  const [
    secondField,
    minuteField,
    hourField,
    dayOfMonthField,
    monthField,
    dayOfWeekField
  ] = fields;

  // 解析各字段
  const seconds = parseCronField(secondField, 0, 59);
  const minutes = parseCronField(minuteField, 0, 59);
  const hours = parseCronField(hourField, 0, 23);
  const daysOfMonth = parseCronField(dayOfMonthField, 1, 31);
  const months = parseCronField(monthField, 1, 12);

  // 周字段特殊处理：0 和 7 都代表星期日
  const rawDaysOfWeek = parseCronField(dayOfWeekField, 0, 7);
  const daysOfWeek = new Set<number>();
  for (const day of rawDaysOfWeek) {
    daysOfWeek.add(day === 0 ? 7 : day); // 将0转换为7
  }

  return {
    seconds,
    minutes,
    hours,
    daysOfMonth,
    months,
    daysOfWeek: Array.from(daysOfWeek).sort((a, b) => a - b)
  };
}

/**
 * 检查给定日期是否匹配cron规则
 * @param date 要检查的日期对象
 * @param cronFields 解析后的cron字段
 * @returns 是否匹配
 */
function isCronMatch(date: Date, cronFields: ReturnType<typeof parseCron>): boolean {
  const second = date.getSeconds();
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // 月份从1开始
  const dayOfWeek = date.getDay() || 7; // 0(星期日)转换为7

  // 检查秒、分、时、月
  if (!cronFields.seconds.includes(second)) return false;
  if (!cronFields.minutes.includes(minute)) return false;
  if (!cronFields.hours.includes(hour)) return false;
  if (!cronFields.months.includes(month)) return false;

  // 检查日：日字段或周字段匹配即可（OR关系）
  const dayMatch = cronFields.daysOfMonth.includes(dayOfMonth);
  const weekMatch = cronFields.daysOfWeek.includes(dayOfWeek);

  return dayMatch || weekMatch;
}

/**
 * 获取cron表达式未来n次运行的时间戳
 * @param cron cron表达式
 * @param n 需要获取的次数
 * @param startTime 起始时间戳（毫秒），默认为当前时间
 * @returns 未来n次运行的时间戳数组（单位：秒）
 */
export function getNextCronTimestamps(
  cron: string,
  n: number,
  startTime: number = Date.now()
): number[] {
  // 解析cron表达式
  const cronFields = parseCron(cron);

  // 起始时间（跳过当前秒）
  let current = new Date(startTime);
  current.setMilliseconds(0);
  current.setSeconds(current.getSeconds() + 1); // 从下一秒开始

  const timestamps: number[] = [];
  const maxIterations = 1000000; // 防止无限循环
  let iterations = 0;

  while (timestamps.length < n && iterations < maxIterations) {
    if (isCronMatch(current, cronFields)) {
      // 转换为秒级时间戳
      timestamps.push(Math.floor(current.getTime() / 1000));
    }

    // 增加1秒继续检查
    current.setSeconds(current.getSeconds() + 1);
    iterations++;
  }

  if (timestamps.length < n) {
    throw new Error(`Reached maximum iterations (${maxIterations}) before finding ${n} timestamps`);
  }

  return timestamps;
}

