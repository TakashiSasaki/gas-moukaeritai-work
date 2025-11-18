# Calendar Log

## Overview

This Google Apps Script project, "Calendar Log," is a web application that provides an interface for managing Google Calendar events. Users can select a calendar, view events from the past and upcoming week, create new events, and delete existing ones. The app also displays the URL of the selected calendar and the web app itself.

## Functionality

The application provides a web-based interface with three tabs: "Create Event," "Event List," and "Settings."

### Core Features

- **`doGet()`:** The main entry point for the web app, which renders the user interface.
- **Calendar Management:**
    - `getCalendars()`: Retrieves a list of all the user's calendars.
    - `getUserSelectedCalendarId()`: Gets the ID of the calendar the user has selected.
    - `saveUserSelectedCalendarId(calendarId)`: Saves the user's selected calendar ID to user properties.
- **Event Management:**
    - `getEventsForSelectedCalendar()`: Retrieves events from the selected calendar for the past and upcoming week.
    - `createNewEvent(eventData)`: Creates a new event in the selected calendar.
    - `deleteEvent(eventId)`: Deletes an event from the selected calendar.
- **Settings:**
    - `getAppSettings()`: Retrieves the URL of the selected calendar and the URL of the web app itself.

### Code Examples

#### `Code.js`
```javascript
function getEventsForSelectedCalendar() {
  const userProperties = PropertiesService.getUserProperties();
  const selectedCalendarId = userProperties.getProperty('selectedCalendarId');

  if (!selectedCalendarId) {
    return [];
  }

  const calendar = CalendarApp.getCalendarById(selectedCalendarId);
  if (!calendar) {
    return [];
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const events = calendar.getEvents(oneWeekAgo, oneWeekFromNow);
  // ... (code to map events to a simpler format)
}

function createNewEvent(eventData) {
  const userProperties = PropertiesService.getUserProperties();
  const selectedCalendarId = userProperties.getProperty('selectedCalendarId');

  if (!selectedCalendarId) {
    throw new Error('操作対象のカレンダーが選択されていません。');
  }

  const calendar = CalendarApp.getCalendarById(selectedCalendarId);
  // ... (code to create a new event)
}
```

## Permissions

The `appsscript.json` file specifies that the web app is accessible to anyone and executes as the user who deployed it.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
}
```

## Deployments

The project has two deployments:

- **ID (HEAD):** `AKfycbyNaV2BIThZqv2Z44aOzUBXlSJvQmVSm-8yNJ7LXSc_`
  - **URL:** `https://script.google.com/macros/s/AKfycbyNaV2BIThZqv2Z44aOzUBXlSJvQmVSm-8yNJ7LXSc_/exec`
- **ID (Version 5):** `AKfycbwIBsJPyorIK0lbiWmPixxW9XGx3ZpXz8HIiX5Jc2E4fxb_NnFF5y5y6q7F6yPcwlhhOQ`
  - **URL:** `https://script.google.com/macros/s/AKfycbwIBsJPyorIK0lbiWmPixxW9XGx3ZpXz8HIiX5Jc2E4fxb_NnFF5y5y6q7F6yPcwlhhOQ/exec`
