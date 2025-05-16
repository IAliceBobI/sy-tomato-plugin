import { siyuan } from "./utils";

export function calcAge(age: string, blockID: string) {
    const { years, months, days } = calculateAge(age);
    siyuan.insertBlockAfter(`${years}岁${months}月${days}天`, blockID)
}

function calculateAge(birthday: string): { years: number, months: number, days: number } {
    // Parse the birthday string into Date object
    const birthDate = new Date(`${birthday.substring(0, 4)}-${birthday.substring(4, 6)}-${birthday.substring(6, 8)}`);

    // Check if the birthDate is valid
    if (isNaN(birthDate.getTime())) {
        throw new Error('Invalid birthday format');
    }

    // Get today's date
    const today = new Date();

    // Calculate the difference in years, months, and days
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust the values if necessary
    if (days < 0) {
        // Borrow a month
        months -= 1;
        // Get the last day of the previous month
        const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += lastDayOfPrevMonth;
    }

    if (months < 0) {
        // Borrow a year
        years -= 1;
        months += 12;
    }

    return { years, months, days };
}

export function getDirectTextContent(element: Element) {
    const text = new Str();
    for (let child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            text.add(child.textContent)
        }
    }
    return text.join()
}

export class Str<T> {
    private data: T[];
    constructor(data: T[] = []) {
        this.data = data;
    }
    add(...items: T[]): void {
        this.data.push(...items);
    }
    join(separator: string = ''): string {
        return this.data.join(separator);
    }
    static safeJoin<T>(arr: T[] | null | undefined, separator: string = ''): string {
        if (arr == null) return '';
        return Array.isArray(arr) ? arr.join(separator) : '';
    }
}