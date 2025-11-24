export class DateTimeUtil {
  static DAYS_IN_WEEK = 7;

  static SECOND = 1000;
  static MINUTE = 1000 * 60;
  static HOUR = 1000 * 60 * 60;
  static DAY = 1000 * 60 * 60 * 24;
  static WEEK = DateTimeUtil.DAY * DateTimeUtil.DAYS_IN_WEEK;
  static MONTH = DateTimeUtil.DAY * 30;
  static YEAR = DateTimeUtil.MONTH * 12;
}
