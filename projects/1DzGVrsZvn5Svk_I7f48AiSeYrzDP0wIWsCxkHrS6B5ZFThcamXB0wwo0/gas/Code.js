function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Google Calendar Web App');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function getCalendars() {
  const calendars = CalendarApp.getAllCalendars();
  return calendars.map(calendar => ({
    id: calendar.getId(),
    name: calendar.getName()
  }));
}

function getUserSelectedCalendarId() {
  const userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('selectedCalendarId');
}

function saveUserSelectedCalendarId(calendarId) {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('selectedCalendarId', calendarId);
}

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
  return events.map(event => ({
    id: event.getId(),
    title: event.getTitle(),
    startTime: event.getStartTime().toLocaleString(),
    endTime: event.getEndTime().toLocaleString(),
    startDate: Utilities.formatDate(event.getStartTime(), CalendarApp.getTimeZone(), 'yyyy-MM-dd'),
    endDate: Utilities.formatDate(event.getEndTime(), CalendarApp.getTimeZone(), 'yyyy-MM-dd'),
    _startTime: Utilities.formatDate(event.getStartTime(), CalendarApp.getTimeZone(), 'HH:mm'),
    _endTime: Utilities.formatDate(event.getEndTime(), CalendarApp.getTimeZone(), 'HH:mm'),
    description: event.getDescription() || '',
    location: event.getLocation() || ''
  }));
}

function createNewEvent(eventData) {
  const userProperties = PropertiesService.getUserProperties();
  const selectedCalendarId = userProperties.getProperty('selectedCalendarId');

  if (!selectedCalendarId) {
    throw new Error('操作対象のカレンダーが選択されていません。');
  }

  const calendar = CalendarApp.getCalendarById(selectedCalendarId);
  if (!calendar) {
    throw new Error('指定されたカレンダーが見つかりません。');
  }

  const startDate = new Date(eventData.startDate + ' ' + eventData.startTime);
  const endDate = new Date(eventData.endDate + ' ' + eventData.endTime);

  const newEvent = calendar.createEvent(eventData.title, startDate, endDate, {
    description: eventData.description,
    location: eventData.location
  });

  return {
    title: newEvent.getTitle(),
    startTime: newEvent.getStartTime().toLocaleString(),
    endTime: newEvent.getEndTime().toLocaleString()
  };
}

function deleteEvent(eventId) {
  const userProperties = PropertiesService.getUserProperties();
  const selectedCalendarId = userProperties.getProperty('selectedCalendarId');

  if (!selectedCalendarId) {
    throw new Error('操作対象のカレンダーが選択されていません。');
  }

  const calendar = CalendarApp.getCalendarById(selectedCalendarId);
  if (!calendar) {
    throw new Error('指定されたカレンダーが見つかりません。');
  }

  const event = calendar.getEventById(eventId);
  if (event) {
    event.deleteEvent();
    return true;
  } else {
    throw new Error('指定されたイベントが見つかりませんでした。');
  }
}

// 追加：選択したカレンダーのURLとウェブアプリのURLを取得する関数
function getAppSettings() {
  const userProperties = PropertiesService.getUserProperties();
  const selectedCalendarId = userProperties.getProperty('selectedCalendarId');
  let selectedCalendarUrl = 'N/A';

  if (selectedCalendarId) {
    const calendar = CalendarApp.getCalendarById(selectedCalendarId);
    if (calendar) {
      // Google Calendarの公開URL形式（例）
      // 一般的に、カレンダーIDがあればURLを構築できることが多いが、
      // 厳密な公開URLはGoogle Calendarの設定に依存するため、
      // ここでは簡略化して構築する。必要に応じてAdjust
      selectedCalendarUrl = `https://calendar.google.com/calendar/embed?src=${selectedCalendarId}`;
    }
  }

  // WebアプリのURLはScriptAppで取得できる
  const webAppUrl = ScriptApp.getService().getUrl();

  return {
    selectedCalendarUrl: selectedCalendarUrl,
    webAppUrl: webAppUrl
  };
}