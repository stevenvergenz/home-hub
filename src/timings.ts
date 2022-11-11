/** Every minute on the 0 */
export const timeCron = "0 * * * * *";
/** Every hour on the 0 */
export const dateCron = "0 0 * * * *";
/** Every hour from 6am to midnight */
export const calendarCron = "0 0 0,6-23 * * *";
/** Every hour from 6am to midnight on the 1's */
export const aqiCron = "0 1 0,6-23 * * *";
/** Every hour from 6am to midnight on the 2's */
export const weatherCron = "0 2 6-23 * * *";
/** Every three hours from 5am to 11pm on the 3's */
export const forecastCron = "0 3 5-23/3 * * *";
/** Every three hours from 5am to 11pm on the 4's */
export const tasksCron = "0 4 6-23 * * *";
