import { sanitizeHTMLToDom } from 'obsidian';

export interface ZoteroRawItem {
    key: string;
    title?: string;
    shortTitle?: string;
    creators?: any[];
    date?: string;
    note?: string;
    extra?: string;
}

/** @public */
export class ZoteroItem {
    raw: ZoteroRawItem;

    constructor(raw: ZoteroRawItem) {
        this.raw = raw;
    }

    getKey() {
        return this.raw.key;
    }

    getTitle() {
        return (
            this.raw.title ||
            this.raw.shortTitle ||
            this.getNoteExcerpt() ||
            '[No Title]'
        );
    }

    getShortTitle() {
        return this.raw.shortTitle;
    }

    getAuthors() {
        return this.getCreators()
            .filter((creator) => creator.creatorType === 'author')
            .map(this.normalizeName);
    }

    getAuthor() {
        return this.getAuthors()[0];
    }

    getCreators() {
        return this.raw.creators || [];
    }

    getDate() {
        return this.raw.date
            ? this.formatDate(this.raw.date)
            : { year: null, month: null, day: null };
    }

    getNoteExcerpt() {
        if (this.raw.note) {
            const div = document.createElement('div');
            div.appendChild(sanitizeHTMLToDom(this.raw.note));
            return (
                (div.textContent || div.innerText || '')
                    .trim()
                    .substring(0, 50) + '...'
            );
        }

        return '';
    }

    normalizeName(creator: any) {
        const names = {
            firstName: creator.firstName,
            lastName: creator.lastName,
            fullName: '',
        };

        if (creator.hasOwnProperty('name')) {
            const delimiter = creator.name.lastIndexOf(' ');
            names.firstName = creator.name.substring(0, delimiter + 1).trim();
            names.lastName = creator.name.substring(delimiter).trim();
            names.fullName = creator.name;
        } else {
            names.fullName = `${names.firstName} ${names.lastName}`;
        }

        return names;
    }

    formatDate(date: string) {
        const dateObject = new Date(date);

        if (isNaN(dateObject.getTime())) {
            return null;
        }

        return {
            year: dateObject.getFullYear(),
            month: dateObject.getMonth() + 1,
            day: dateObject.getDate(),
        };
    }

    getValues() {
        return {
            key: this.getKey(),
            title: this.getTitle(),
            shortTitle: this.getShortTitle(),
            date: this.getDate(),
            authors: this.getAuthors(),
            firstAuthor: this.getAuthor(),
        };
    }

    getCitationKey() {
        const extra = this.raw.extra || '';
        const match = extra.match(/Citation Key:\s*(\S+)/);
        return match ? match[1] : null;
    }
}
