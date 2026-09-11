/*! Copyright 2026 Fonticons, Inc. - https://webawesome.com/license */
import {
  de_default
} from "../chunks/chunk.JEFGOKSA.js";
import "../chunks/chunk.4QWUDRS5.js";
import "../chunks/chunk.E2G7AAZ3.js";
import {
  registerTranslation
} from "../chunks/chunk.HOKYDFUG.js";
import "../chunks/chunk.JHZRD2LV.js";

// src/translations/de-ch.ts
var translation = {
  ...de_default,
  $code: "de-CH",
  $name: "Deutsch (Schweiz)",
  am: "AM",
  autosizeColumn: "Spaltenbreite anpassen",
  captions: "Untertitel",
  carousel: "Karussell",
  chooseDate: "Datum ausw\xE4hlen",
  chooseDecade: "Jahrzehnt ausw\xE4hlen",
  chooseMonth: "Monat ausw\xE4hlen",
  chooseTime: "Uhrzeit ausw\xE4hlen",
  chooseYear: "Jahr ausw\xE4hlen",
  clearEntry: "Eingabe l\xF6schen",
  clearSort: "Sortierung aufheben",
  close: "Schliessen",
  closeCalendar: "Kalender schliessen",
  closeTimeInput: "Uhrzeitauswahl schliessen",
  collapseRow: "Zeile einklappen",
  columnMenu: "Spaltenoptionen",
  columnMovedToPosition: (label, position, total) => `${label} an Position ${position} von ${total} verschoben`,
  columns: "Spalten",
  compactPageXOfY: (page, total) => `${page} von ${total}`,
  copied: "Kopiert",
  copy: "Kopieren",
  createOption: (value) => `\u201E${value}" erstellen`,
  currentlyPlaying: "wird gerade abgespielt",
  currentValue: "Aktueller Wert",
  date: "Datum",
  datePickerKeyboardHelp: "Verwenden Sie die Pfeiltasten, um Werte zu \xE4ndern; dr\xFCcken Sie Alt+Pfeil nach unten, um den Kalender zu \xF6ffnen.",
  day: "Tag",
  dayPeriod: "AM/PM",
  decrement: "Verringern",
  deselectAllRows: "Alle Zeilen abw\xE4hlen",
  dropFileHere: "Datei hier ablegen oder zum Durchsuchen klicken",
  dropFilesHere: "Dateien hier ablegen oder zum Durchsuchen klicken",
  empty: "Leer",
  endDate: "Enddatum",
  enterFullscreen: "Vollbildmodus aktivieren",
  error: "Fehler",
  exitFullscreen: "Vollbildmodus beenden",
  expandRow: "Zeile ausklappen",
  filterByColumn: (label) => `Nach ${label} filtern`,
  filterFrom: "Von",
  filterMax: "Max",
  filterMin: "Min",
  filterTo: "Bis",
  firstPage: "Erste Seite",
  goToSlide: (slide, count) => `Zu Folie ${slide} von ${count} gehen`,
  hideColumn: "Spalte ausblenden",
  hidePassword: "Passwort verbergen",
  hour: "Stunde",
  incompleteDate: "Geben Sie ein g\xFCltiges Datum ein.",
  increment: "Erh\xF6hen",
  jumpBackwardX: (count) => `${count} Seiten zur\xFCckspringen`,
  jumpForwardX: (count) => `${count} Seiten vorw\xE4rtsspringen`,
  lastPage: "Letzte Seite",
  loading: "Wird geladen",
  minute: "Minute",
  month: "Monat",
  moreOptions: "Weitere Optionen",
  mute: "Stummschalten",
  nextDecade: "N\xE4chstes Jahrzehnt",
  nextMonth: "N\xE4chster Monat",
  nextPage: "N\xE4chste Seite",
  nextSlide: "N\xE4chste Folie",
  nextVideo: "N\xE4chstes Video",
  nextYear: "N\xE4chstes Jahr",
  noData: "Keine Daten",
  now: "Jetzt",
  numCharacters: (num) => {
    if (num === 1) return "1 Zeichen";
    return `${num} Zeichen`;
  },
  numCharactersRemaining: (num) => {
    if (num === 1) return "1 Zeichen verbleibend";
    return `${num} Zeichen verbleibend`;
  },
  numOptionsSelected: (num) => {
    if (num === 0) return "Keine Optionen ausgew\xE4hlt";
    if (num === 1) return "1 Option ausgew\xE4hlt";
    return `${num} Optionen ausgew\xE4hlt`;
  },
  numRowsCopied: (num) => num === 1 ? "1 Zeile kopiert" : `${num} Zeilen kopiert`,
  numRowsSelected: (num) => num === 1 ? "1 Zeile ausgew\xE4hlt" : `${num} Zeilen ausgew\xE4hlt`,
  pageXOfY: (page, total) => `Seite ${page} von ${total}`,
  pagination: "Seitennavigation",
  pause: "Pausieren",
  pauseAnimation: "Animation pausieren",
  pictureInPicture: "Bild im Bild",
  pinLeft: "Links anheften",
  pinRight: "Rechts anheften",
  play: "Abspielen",
  playAnimation: "Animation abspielen",
  playbackSpeed: "Abspielgeschwindigkeit",
  playlist: "Wiedergabeliste",
  pm: "PM",
  previousDecade: "Vorheriges Jahrzehnt",
  previousMonth: "Vorheriger Monat",
  previousPage: "Vorherige Seite",
  previousSlide: "Vorherige Folie",
  previousVideo: "Vorheriges Video",
  previousYear: "Vorheriges Jahr",
  progress: "Fortschritt",
  rangeTooLong: (max) => {
    if (max === 1) return "W\xE4hlen Sie einen Zeitraum von h\xF6chstens 1 Tag";
    return `W\xE4hlen Sie einen Zeitraum von h\xF6chstens ${max} Tagen`;
  },
  rangeTooShort: (min) => {
    if (min === 1) return "W\xE4hlen Sie einen Zeitraum von mindestens 1 Tag";
    return `W\xE4hlen Sie einen Zeitraum von mindestens ${min} Tagen`;
  },
  readonly: "Schreibgesch\xFCtzt",
  remove: "Entfernen",
  resize: "Gr\xF6sse \xE4ndern",
  resizeColumn: "Spaltenbreite \xE4ndern",
  rowsPerPage: "Zeilen pro Seite",
  scrollableRegion: "Scrollbarer Bereich",
  scrollToEnd: "Zum Ende scrollen",
  scrollToStart: "Zum Anfang scrollen",
  search: "Suchen",
  second: "Sekunde",
  seek: "Suchen",
  seekProgress: (current, duration) => `${current} von ${duration}`,
  selectAColorFromTheScreen: "Farbe vom Bildschirm ausw\xE4hlen",
  selectAllRows: "Alle Zeilen ausw\xE4hlen",
  selected: "Ausgew\xE4hlt",
  selectedDateLabel: (date) => `Ausgew\xE4hlt: ${date}`,
  selectedRangeLabel: (range) => `Ausgew\xE4hlter Zeitraum: ${range}`,
  selectGroup: "Gruppe ausw\xE4hlen",
  selectionCleared: "Auswahl aufgehoben",
  selectRow: "Zeile ausw\xE4hlen",
  showingNofMRows: (shown, total) => `${shown} von ${total} Zeilen werden angezeigt`,
  showingXtoYofZ: (start, end, total) => `${start}\u2013${end} von ${total}`,
  showPassword: "Passwort anzeigen",
  slideNum: (slide) => `Folie ${slide}`,
  sortAscending: "Aufsteigend sortieren",
  sortColumn: "Spalte sortieren",
  sortDescending: "Absteigend sortieren",
  startDate: "Startdatum",
  time: "Uhrzeit",
  timeInputKeyboardHelp: "Verwenden Sie die Pfeiltasten, um Werte zu \xE4ndern; dr\xFCcken Sie Alt+Pfeil nach unten, um die Uhrzeitauswahl zu \xF6ffnen.",
  today: "Heute",
  toggleColorFormat: "Farbformat wechseln",
  unmute: "Stummschaltung aufheben",
  unpin: "L\xF6sen",
  unpinColumn: "Spalte l\xF6sen",
  videoPlayer: "Videoplayer",
  volume: "Lautst\xE4rke",
  year: "Jahr",
  zoomIn: "Hineinzoomen",
  zoomOut: "Herauszoomen"
};
registerTranslation(translation);
var de_ch_default = translation;
export {
  de_ch_default as default
};
