export class ClickEvent {
    constructor({ elementId, targetUrl = null, erroneous = false, timestamp = Date.now() }) {
        this.type = 'CLICK';
        this.elementId = elementId;
        this.targetUrl = targetUrl;
        this.erroneous = erroneous;
        this.timestamp = timestamp;
    }

}

export class ScrollEvent {
    constructor({ start, end, duration, timestamp = Date.now() }) {
        this.type = 'SCROLL';
        this.start = start;
        this.end = end;
        this.duration = duration;
        this.timestamp = timestamp;
    }
}

// Altre classi per altri tipi di evento...