import { defineBaseMetaTags } from 'svelte-meta-tags';

export async function load({ url }) {
    return {
        ...defineBaseMetaTags({
            title: 'Groovy',
            description: 'An open music sharing & library',
            keywords: ['music', 'lyrics', 'groovy'],
            canonical: new URL(url.pathname, url.origin).href,
            openGraph: {
                type: 'website',
                url: new URL(url.pathname, url.origin).href,
                title: 'Groovy',
                locale: 'en_US',
                description: 'An open music sharing & library',
                siteName: 'Groovy'
            }
        })
    };
}
