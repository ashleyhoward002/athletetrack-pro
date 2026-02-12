// Calendar utility functions for ICS and Google Calendar integration

export interface CalendarEvent {
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    allDay?: boolean;
}

/**
 * Generate an ICS file content string for a calendar event
 */
export function generateICS(event: CalendarEvent): string {
    const formatDate = (date: Date, allDay: boolean): string => {
        if (allDay) {
            return date.toISOString().split("T")[0].replace(/-/g, "");
        }
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const escapeText = (text: string): string => {
        return text
            .replace(/\\/g, "\\\\")
            .replace(/;/g, "\\;")
            .replace(/,/g, "\\,")
            .replace(/\n/g, "\\n");
    };

    const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@athletetrack.app`;
    const now = new Date();
    const endDate = event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//AthleteTrack Pro//Game Schedule//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${formatDate(now, false)}`,
    ];

    if (event.allDay) {
        lines.push(`DTSTART;VALUE=DATE:${formatDate(event.startDate, true)}`);
        lines.push(`DTEND;VALUE=DATE:${formatDate(new Date(event.startDate.getTime() + 24 * 60 * 60 * 1000), true)}`);
    } else {
        lines.push(`DTSTART:${formatDate(event.startDate, false)}`);
        lines.push(`DTEND:${formatDate(endDate, false)}`);
    }

    lines.push(`SUMMARY:${escapeText(event.title)}`);

    if (event.description) {
        lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    }

    if (event.location) {
        lines.push(`LOCATION:${escapeText(event.location)}`);
    }

    // Add reminder (1 hour before)
    lines.push("BEGIN:VALARM");
    lines.push("TRIGGER:-PT1H");
    lines.push("ACTION:DISPLAY");
    lines.push(`DESCRIPTION:${escapeText(event.title)} is starting soon!`);
    lines.push("END:VALARM");

    lines.push("END:VEVENT");
    lines.push("END:VCALENDAR");

    return lines.join("\r\n");
}

/**
 * Generate a Google Calendar URL for adding an event
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
    const formatGoogleDate = (date: Date, allDay: boolean): string => {
        if (allDay) {
            return date.toISOString().split("T")[0].replace(/-/g, "");
        }
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const endDate = event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000);

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${formatGoogleDate(event.startDate, event.allDay || false)}/${formatGoogleDate(endDate, event.allDay || false)}`,
    });

    if (event.description) {
        params.set("details", event.description);
    }

    if (event.location) {
        params.set("location", event.location);
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an Outlook Web calendar URL
 */
export function generateOutlookUrl(event: CalendarEvent): string {
    const endDate = event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000);

    const params = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        subject: event.title,
        startdt: event.startDate.toISOString(),
        enddt: endDate.toISOString(),
    });

    if (event.description) {
        params.set("body", event.description);
    }

    if (event.location) {
        params.set("location", event.location);
    }

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Create a calendar event from a scheduled game
 */
export function gameToCalendarEvent(game: {
    opponent: string;
    sport: string;
    game_date: string;
    game_time?: string | null;
    location?: string | null;
    notes?: string | null;
    is_home_game?: boolean;
}): CalendarEvent {
    const sportEmoji: Record<string, string> = {
        basketball: "🏀",
        baseball: "⚾",
        soccer: "⚽",
        football: "🏈",
        tennis: "🎾",
        volleyball: "🏐",
    };

    const emoji = sportEmoji[game.sport] || "🏆";
    const homeAway = game.is_home_game ? "vs" : "@";
    const title = `${emoji} ${homeAway} ${game.opponent}`;

    let startDate: Date;
    if (game.game_time) {
        startDate = new Date(`${game.game_date}T${game.game_time}`);
    } else {
        startDate = new Date(`${game.game_date}T12:00:00`);
    }

    const description = [
        `${game.sport.charAt(0).toUpperCase() + game.sport.slice(1)} Game`,
        game.is_home_game ? "Home Game" : "Away Game",
        game.notes ? `\nNotes: ${game.notes}` : "",
    ].filter(Boolean).join("\n");

    return {
        title,
        description,
        location: game.location || undefined,
        startDate,
        allDay: !game.game_time,
    };
}

/**
 * Download an ICS file in the browser
 */
export function downloadICS(event: CalendarEvent, filename: string = "game.ics"): void {
    const icsContent = generateICS(event);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
