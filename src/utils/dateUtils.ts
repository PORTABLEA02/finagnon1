import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';

const timeZone = 'Africa/Porto-Novo'; // Fuseau horaire du Bénin/Cameroun

/**
 * Convertit une date locale en chaîne de caractères au format YYYY-MM-DD
 * en tenant compte du fuseau horaire
 */
export function formatDateForDatabase(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localDate = utcToZonedTime(dateObj, timeZone);
  return format(localDate, 'yyyy-MM-dd', { timeZone });
}

/**
 * Convertit une chaîne de date de la base de données en date locale
 */
export function parseDateFromDatabase(dateString: string): Date {
  const utcDate = new Date(dateString + 'T00:00:00Z');
  return utcToZonedTime(utcDate, timeZone);
}

/**
 * Obtient la date actuelle au format YYYY-MM-DD dans le fuseau horaire local
 */
export function getCurrentDateString(): string {
  const now = new Date();
  const localDate = utcToZonedTime(now, timeZone);
  return format(localDate, 'yyyy-MM-dd', { timeZone });
}

/**
 * Formate une date pour l'affichage en français
 */
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseDateFromDatabase(date) : date;
  const localDate = utcToZonedTime(dateObj, timeZone);
  return format(localDate, 'dd/MM/yyyy', { timeZone });
}

/**
 * Formate une date pour l'affichage complet en français
 */
export function formatDateTimeForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localDate = utcToZonedTime(dateObj, timeZone);
  return format(localDate, 'dd/MM/yyyy HH:mm', { timeZone });
}

/**
 * Vérifie si une date est aujourd'hui
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseDateFromDatabase(date) : date;
  const today = new Date();
  const localDate = utcToZonedTime(dateObj, timeZone);
  const localToday = utcToZonedTime(today, timeZone);
  
  return format(localDate, 'yyyy-MM-dd', { timeZone }) === format(localToday, 'yyyy-MM-dd', { timeZone });
}

/**
 * Calcule l'âge à partir d'une date de naissance
 */
export function calculateAge(dateOfBirth: string): number {
  const birthDate = parseDateFromDatabase(dateOfBirth);
  const today = utcToZonedTime(new Date(), timeZone);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}