import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ items: [] });
    }

    try {
        // Using Steam Store Search (undocumented but widely used public API)
        // Does not strictly require API Key, but we use it server-side to avoid CORS.
        const response = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`);

        if (!response.ok) {
            throw new Error(`Steam API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform to match our app's expected shape or keep as raw steam items
        // We'll normalize them slightly for the frontend
        const items = data.items?.map(item => ({
            id: item.id,
            title: item.name,
            steam_id: item.id,
            // construct high quality image url if possible, or use tiny_image
            cover_url: item.tiny_image || `https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg`,
            platforms: item.platforms ? Object.keys(item.platforms).filter(k => item.platforms[k]) : ['PC']
        })) || [];

        return NextResponse.json({ items });

    } catch (error) {
        console.error("Steam Search Error:", error);
        return NextResponse.json({ error: "Failed to fetch from Steam" }, { status: 500 });
    }
}
