import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "white rice, egg, fresh meat, fresh fish, fresh vegetables, fresh fruit, cooking oil, sugar, salt, flour, milk, butter";
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "100"; // Fetch a large batch

  try {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error("SERPAPI_KEY is not set in environment variables");
    }

    const foodKeywords = "fresh produce edible grocery";
    const finalQuery = query ? `${query} ${foodKeywords}` : foodKeywords;
    const start = (parseInt(page) - 1) * parseInt(limit);

    const response = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(
        finalQuery
      )}&tbm=shop&hl=id&gl=id&num=${limit}&start=${start}&api_key=${apiKey}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    console.log("SerpAPI Raw Response:", {
      status: response.status,
      shopping_results_length: data.shopping_results?.length,
      total_results: data.search_metadata?.total_results || data.pagination?.total_results,
      query: finalQuery,
      page,
      start,
    });

    const shoppingResults = (data.shopping_results || []).filter((item: any) => {
      const title = item.title?.toLowerCase() || "";
      return (
        !title.includes("seasoning mix") &&
        !title.includes("spice blend") &&
        !title.includes("extract") &&
        (title.includes("fresh") ||
          title.includes("raw") ||
          title.includes("vegetable") ||
          title.includes("fruit") ||
          title.includes("meat") ||
          title.includes("fish") ||
          title.includes("rice") ||
          title.includes("egg") ||
          title.includes("oil") ||
          title.includes("sugar") ||
          title.includes("salt") ||
          title.includes("flour") ||
          title.includes("milk") ||
          title.includes("butter") ||
          !title.includes("seasoning"))
      );
    });

    console.log("Filtered Results:", {
      filtered_length: shoppingResults.length,
      filtered_titles: shoppingResults.map((item: any) => item.title),
    });

    const resultsPerPage = shoppingResults.length;
    const totalFilteredResults = data.search_metadata?.total_results || data.pagination?.total_results || resultsPerPage;

    const pagination = {
      current: parseInt(page),
      total: totalFilteredResults,
      next: resultsPerPage === parseInt(limit) && start + parseInt(limit) < totalFilteredResults,
    };

    return NextResponse.json({
      shopping_results: shoppingResults,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching from SerpAPI:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}