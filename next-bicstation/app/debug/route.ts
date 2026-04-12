import { NextResponse } from 'next/server';

export async function GET() {
    // const INTERNAL_API_URL = 'http://django-v3:8000/api/posts/?page_size=100&site=bicstation';
    const INTERNAL_API_URL = 'http://django-v3:8000/api/general/pc-products/popularity-ranking/?site=bicstation';
    
    try {
        const res = await fetch(INTERNAL_API_URL, {
            headers: { 'Host': 'api.bicstation.com' }
        });
        const data = await res.json();
        // DjangoのデータをそのままJSONとしてブラウザに表示
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: 'Could not connect to Django' }, { status: 500 });
    }
}