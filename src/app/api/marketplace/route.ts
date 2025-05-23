import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'white rice, egg, meat, fish, vegetables, fruit, cooking oil, sugar, salt, flour, milk, butter'; 
  const page = searchParams.get('page') || '1';

  try {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error('SERPAPI_KEY is not set in environment variables');
    }

    // Menghapus parameter location=Indonesia dan mengatur hl=en untuk bahasa Inggris
    const response = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=shop&hl=en&gl=us&page=${page}&api_key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Transform data sesuai kebutuhan frontend
    const shoppingResults = data.shopping_results || [];
    const pagination = data.pagination || { current: 1, next: null, total: 100 };

    return NextResponse.json({
      shopping_results: shoppingResults,
      pagination: pagination,
    });
  } catch (error) {
    console.error('Error fetching from SerpAPI:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}