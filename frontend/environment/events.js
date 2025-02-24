export class ClickEvent {
    // TODO: implement class events
    constructor({ elementId, targetUrl = null, erroneous = false, timestamp = Date.now() }) {
        this.type = 'click';
        this.elementId = elementId;
        this.targetUrl = targetUrl;
        this.erroneous = erroneous;
        this.timestamp = timestamp;
        this.clickCount = 1; // Inizializza il conteggio dei click
    }

    increment() {
        this.clickCount++;
    }
}

export class ScrollEvent {
    constructor({ start, end, duration, timestamp = Date.now() }) {
        this.type = 'scroll';
        this.start = start;
        this.end = end;
        this.duration = duration;
        this.timestamp = timestamp;
    }
}

// Altre classi per altri tipi di evento...