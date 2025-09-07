export default function debounce(func, delay) {

  let timeoutId; 
 
  return function(...args) {

    const context = this; // Preserve the 'this' context
 
    // Clear the previous timeout if it exists

    if (timeoutId) {

      clearTimeout(timeoutId);

    }
 
    // Set a new timeout

    timeoutId = setTimeout(() => {

      func.apply(context, args); // Execute the original function

    }, delay);

  };

}
 