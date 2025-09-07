import { format, parseISO, isValid } from 'date-fns';

// Standard date format: MM/dd/yyyy
export const STANDARD_DATE_FORMAT = 'MM/dd/yyyy';

/**
 * Format date to MM/dd/yyyy format consistently across the app
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Handle various string formats
      if (date.includes('T') || date.includes('Z')) {
        // ISO format
        dateObj = parseISO(date);
      } else {
        // Simple date string
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return '';
    }
    
    return format(dateObj, STANDARD_DATE_FORMAT);
  } catch (error) {
    console.warn('Error formatting date:', date, error);
    return '';
  }
};

/**
 * Format date for display in tables and UI
 */
export const formatDateForDisplay = (date: string | Date | null | undefined): string => {
  return formatDate(date);
};

/**
 * Format date for input fields (MM/dd/yyyy)
 */
export const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return '';
    }
    
    return format(dateObj, 'MM/dd/yyyy');
  } catch (error) {
    console.warn('Error formatting date for input:', date, error);
    return '';
  }
};

/**
 * Get current date in MM/dd/yyyy format
 */
export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

/**
 * Get current date in MM/dd/yyyy format for input fields
 */
export const getCurrentDateForInput = (): string => {
  return formatDateForInput(new Date());
};