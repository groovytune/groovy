import { getSupportedMimeTypes } from 'music-metadata';
import tsquery from 'pg-tsquery';
import { getLocale } from './utils';

export const tsQueryParser = new tsquery.Tsquery();

export const supportedAudioMimeTypes = getSupportedMimeTypes();

export const numberFormatter = new Intl.NumberFormat(getLocale(), { notation: 'compact' });

export const categoryInfos = {
    album: {
        name: 'Album',
        description: 'A collection of tracks released together, often sharing a common theme or concept.'
    },
    single: {
        name: 'Single',
        description: 'A standalone track released separately from an album, often used to promote an upcoming album or as a one-off release.'
    },
    ep: {
        name: 'EP',
        description: 'An Extended Play release that is longer than a single but shorter than a full album, typically containing 3-5 tracks.'
    },
    explicit: {
        name: 'Explicit',
        description: 'Content that contains strong language, violence, or other material that may not be suitable for all audiences.'
    },
    public: {
        name: 'Public',
        description: 'Visible to everyone and can be discovered through search and browsing.'
    },
    private: {
        name: 'Private',
        description: 'Only visible to you and cannot be discovered through search or browsing.'
    },
    unlisted: {
        name: 'Unlisted',
        description: 'Not visible on your profile or in search results, but accessible via direct link.'
    }
};
