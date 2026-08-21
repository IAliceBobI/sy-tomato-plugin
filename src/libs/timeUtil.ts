// 时间/日期工具。从原 utils.ts 拆出（2026-08 重构），utils.ts 现为 re-export 桶。
import * as moment from "moment-timezone";

function padStart(input: string, targetLength: number, padString: string): string {
    const inputLength = input.length;
    if (inputLength >= targetLength) {
        return input;
    }
    const paddingLength = targetLength - inputLength;
    const padding = padString.repeat(Math.ceil(paddingLength / padString.length)).slice(0, paddingLength);
    return padding + input;
}

export const timeUtil = {
    nowYMD(d1?: Date) {
        const [ymd, hms] = timeUtil.nowStr(d1).split(" ")
        const [y, M, d] = ymd.split("-")
        const [h, m, s] = hms.split(":")
        return { y: Number(y), M: Number(M), d: Number(d), h: Number(h), m: Number(m), s: Number(s) }
    },
    nowYMDStrPad(d1?: Date) {
        // 检查日期是否有效
        if (!d1 || isNaN(d1.getTime())) {
            d1 = new Date();
        }
        const [ymd, hms] = timeUtil.nowStr(d1).split(" ")
        const [y, M, d] = ymd.split("-")
        const [h, m, s] = hms.split(":")
        return { y: y.padStart(2, "0"), M: M.padStart(2, "0"), d: d.padStart(2, "0"), h: h.padStart(2, "0"), m: m.padStart(2, "0"), s: s.padStart(2, "0") }
    },
    nowYMDStr(secs = 0) {
        const date = timeUtil.now(secs);
        const [ymd, hms] = timeUtil.nowStr(date).split(" ")
        const [y, M, d] = ymd.split("-")
        const [h, m, s] = hms.split(":")
        const y1 = y.padStart(2, "0");
        const M1 = M.padStart(2, "0")
        const d1 = d.padStart(2, "0")
        const h1 = h.padStart(2, "0")
        const m1 = m.padStart(2, "0")
        const s1 = s.padStart(2, "0")
        return { date: y1 + M1 + d1, time: h1 + m1 + s1, datesplit: `${y1}-${M1}-${d1}` }
    },
    nowStr(d?: Date) {
        if (!d) d = new Date()
        return timeUtil.dateFormat(d)
    },
    nowts(secs = 0) {
        return timeUtil.now(secs).getTime() / 1000;
    },
    now(secs = 0) {
        const ts = new Date().getTime() + secs * 1000;
        return new Date(ts);
    },
    getYYYYMMDDHHmmssPlus0(myTimestamp?: number) {
        if (myTimestamp == null) myTimestamp = (new Date().getTime()) / 1000;
        // let myDate = moment.unix(myTimestamp).tz("America/Los_Angeles");
        const myDate = moment.unix(myTimestamp).utcOffset("+0000");
        return myDate.format("YYYYMMDDHHmmss");
    },
    getYYYYMMDDHHmmssPlus8(myTimestamp?: number) {
        if (myTimestamp == null) myTimestamp = (new Date().getTime()) / 1000;
        const myDate = moment.unix(myTimestamp).utcOffset("+0800");
        return myDate.format("YYYYMMDDHHmmss");
    },
    getYYYYMMDDHHmmss(myTimestamp?: number) {
        if (myTimestamp == null) myTimestamp = (new Date().getTime()) / 1000;
        const myDate = moment.unix(myTimestamp);
        return myDate.format("YYYYMMDDHHmmss");
    },
    dateFormat(date?: Date) {
        if (date == null) date = new Date();
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month value needs +1 as it starts from 0.
        const day = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    },
    dateFormatTime(date: Date) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return hours + ":" + minutes + ":" + seconds;
    },
    dateFormatDay(date: Date) {
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return year + "-" + month + "-" + day;
    },
    /**
     * @param date 2024-07-30 08:07:11
     */
    dateFromYYYYMMDDHHmmss(date: string) {
        return new Date(date);
    },
    /**
    * @param date 20240730080711
    */
    dateFromYYYYMMDDHHmmssShort(originalDateStr: string) {
        const year = originalDateStr.slice(0, 4);
        const month = originalDateStr.slice(4, 6);
        const day = originalDateStr.slice(6, 8);
        const hours = originalDateStr.slice(8, 10);
        const minutes = originalDateStr.slice(10, 12);
        const seconds = originalDateStr.slice(12);
        const formattedDateStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return new Date(formattedDateStr);
    },
    checkTimeFormat(input: string) {
        const timeRegex = /^(\d{4})-(\d{1,2})-(\d{1,2}) ?(\d{1,2}):(\d{1,2}):(\d{1,2})$/;

        return timeRegex.test(input);
    },
    makesureDateTimeFormat(input: string) {
        const timeRegex = /^(\d{4})-(\d{1,2})-(\d{1,2}) ?(\d{1,2}):(\d{1,2}):(\d{1,2})$/;
        const zeroPad = (value: string) => {
            const v = value?.toString() ?? "";
            return padStart(v, 2, "0");
        };
        const formattedTimeString = input.replace(timeRegex, (_match, year, month, day, hour, minute, second) => {
            return `${year}-${zeroPad(month)}-${zeroPad(day)} ${zeroPad(hour)}:${zeroPad(minute)}:${zeroPad(second)}`;
        });
        if (new Date(formattedTimeString).toDateString() === "Invalid Date") {
            return "";
        }
        return formattedTimeString;
    },
};
