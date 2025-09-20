/**
 * Input Utilities for preventing unwanted interactions
 */

/**
 * Prevents scroll wheel from changing number input values
 * @param event - The wheel event
 */
export const preventNumberInputScroll = (event: React.WheelEvent<HTMLInputElement>) => {
  // Prevent wheel event on number inputs
  if (event.currentTarget.type === 'number') {
    event.currentTarget.blur();
    event.preventDefault();
  }
};

/**
 * Props to add to number inputs to prevent scroll-to-change behavior
 */
export const noScrollNumberInputProps = {
  onWheel: preventNumberInputScroll,
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    // Also prevent scroll when focused
    e.target.addEventListener('wheel', (wheelEvent) => {
      wheelEvent.preventDefault();
    }, { passive: false });
  },
} as const;

/**
 * Alternative method using onWheel directly
 */
export const preventScrollOnWheel = (e: React.WheelEvent<HTMLInputElement>) => {
  e.currentTarget.blur();
  e.preventDefault();
};

/**
 * Initialize global scroll prevention for all number inputs
 * Call this once in your app initialization
 */
export const initGlobalNumberInputScrollPrevention = () => {
  // Add global event listener for all number inputs
  document.addEventListener('wheel', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
      e.preventDefault();
      (target as HTMLInputElement).blur();
    }
  }, { passive: false });
};
