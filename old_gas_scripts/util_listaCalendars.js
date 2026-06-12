    function listCalendars() {
      let calendars;
      let pageToken;
      do {
        calendars = Calendar.CalendarList.list({
          maxResults: 100,
          pageToken: pageToken
  
        });
        if (!calendars.items || calendars.items.length === 0) {
          Logger.log('No calendars found.');
          return;
        }
        // Print the calendar id and calendar summary
        for (const calendar of calendars.items) {
          Logger.log('%s (ID: %s)', calendar.summary, calendar.id);
        }
        pageToken = calendars.nextPageToken;
      } while (pageToken);
    var lista = listCalendars();
    }
