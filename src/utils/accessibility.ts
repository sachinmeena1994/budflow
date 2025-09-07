
/**
 * Accessibility utilities to improve application accessibility
 */

/**
 * Helper to announce messages to screen readers
 * @param message Message to be announced
 */
export function announceToScreenReader(message: string): void {
  // Create a live region if it doesn't exist
  let liveRegion = document.getElementById('sr-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'sr-live-region';
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    document.body.appendChild(liveRegion);
  }
  
  // Set the message and clear it after a delay
  liveRegion.textContent = message;
  
  // Clear the live region after a delay to prevent repeated announcements
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 3000);
}

/**
 * Common ARIA properties for components
 */
export const ariaAttributes = {
  // Navigation
  navigation: {
    nav: { role: 'navigation' },
    menubar: { role: 'menubar' },
    menu: { role: 'menu' },
    menuitem: { role: 'menuitem' },
  },
  
  // Landmark roles
  landmarks: {
    main: { role: 'main' },
    contentinfo: { role: 'contentinfo' },
    banner: { role: 'banner' },
    complementary: { role: 'complementary' },
  },
  
  // Form controls
  form: {
    form: { role: 'form' },
    search: { role: 'search' },
  },
  
  // Interactive elements
  interactive: {
    button: { role: 'button' },
    link: { role: 'link' },
    checkbox: { role: 'checkbox' },
    radio: { role: 'radio' },
    tab: { role: 'tab' },
    tabpanel: { role: 'tabpanel' },
    tablist: { role: 'tablist' },
    dialog: { role: 'dialog' },
    alertdialog: { role: 'alertdialog' },
  },
  
  // Live regions
  liveRegion: {
    alert: { role: 'alert', 'aria-live': 'assertive', 'aria-atomic': 'true' },
    status: { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' },
    log: { role: 'log', 'aria-live': 'polite' },
    timer: { role: 'timer' },
    marquee: { role: 'marquee', 'aria-live': 'off' },
  },
};

/**
 * Ensure focus is trapped within a modal dialog
 * @param containerId ID of the containing element 
 * @returns Functions to setup and cleanup the focus trap
 */
export function useFocusTrap(containerId: string) {
  const setup = () => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Set initial focus
    firstElement?.focus();
    
    // Handle keyboard trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // If shift+tab and on first element, move to last element
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // If tab and on last element, move to first element
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
      
      // Close on escape
      if (e.key === 'Escape') {
        const closeButton = container.querySelector('[data-dismiss]') as HTMLElement;
        closeButton?.click();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  };
  
  return {
    setupFocusTrap: setup,
  };
}

/**
 * Helper function to generate appropriate ARIA labels 
 * for ReconciliationStatus values
 */
export function getStatusAriaLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'PERFECT_MATCH': 'Perfect match, no action required',
    'MISSING_ITEM': 'Missing item, requires attention',
    'ATTRIBUTE_MISMATCH': 'Attribute mismatch, review differences',
    'MISSING_LAB_DATA': 'Missing lab data, cannot import',
    'QUANTITY_MISMATCH': 'Quantity mismatch, review differences',
    'NEW_PRODUCT': 'New product, review before import',
    'BLOCKED_PRODUCT': 'Blocked product, will not be imported'
  };
  
  return statusMap[status] || 'Unknown status';
}
