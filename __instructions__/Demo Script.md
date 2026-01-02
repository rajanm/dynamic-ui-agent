# Generative UI Demo Script

Record the demo using the browser agent and save it in the docs folder.

1.  **Navigate directly to Generative UI**:

    - URL: `http://localhost:4200/gen-ui` (This ensures we are on the correct tab immediately).
    - wait for selector `app-chat`
    - Action: Type "hi"
    - Action: Click "Send" button or hit Enter.
    - Wait: For response to appear.

2.  **Search for Vehicles**:

    - Action: Type "find honda" into the input box.
    - Action: Click "Send" button or hit Enter.
    - Wait: For results to appear (look for `.surface-wrapper` or table rows).

3.  **Search for Vehicles**:

    - Action: Type "search toyota" into the input box.
    - Action: Click "Send" button or hit Enter.
    - Wait: For results to appear (look for `.surface-wrapper` or table rows).

4.  **Compare Vehicles**:

    - Action: Type "Compare Honda Civic and Toyota Camry".
    - Action: Click "Send" button or hit Enter.
    - Wait: For comparison card (`app-card-comparison` or similar selector).
    - Scroll down so that the comparison cards are fully visible in the browser.

5.  **Book Test Drive**:

    - Action: Click on Book Test Drive button for Honda Civic
    - Wait: For booking form.
    - Action: Fill name as "test user"
    - Action: Fill email as "test@example.com"
    - Action Select calendar icon from date picker and select date of "10-January-2026"
    - Action: Click "Confirm Booking".
    - Wait: For Confirmation message.
    - Scroll to bottom of the page so that the appointment confirmation message is visible.

6.  **Finish**:
    - Wait a few seconds to let the viewer see the final state.
