const DDMMYYHHMMSS = (date: Date | undefined) => {
    if (date) {
        return new Date(date)
            .toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            })
            .replace(/\//g, "-");
    }
}

const DDMMYYYY = (date: Date | undefined) => {
    if (date) {
        return new Date(date)
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
            .replace(/\//g, "-");
    }
}

const HHMMSSZZ = (date: Date | undefined) => {
    if (date) {
        return new Date(date)
            .toLocaleString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            })
            .toUpperCase()
    }
}

export { DDMMYYHHMMSS, DDMMYYYY, HHMMSSZZ };
