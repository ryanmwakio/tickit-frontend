import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Validate the event ID parameter
  if (!id || typeof id !== "string" || id.trim() === "") {
    console.error("❌ Frontend API - Invalid event ID received:", id);
    return NextResponse.json(
      { error: "Invalid event ID provided", receivedId: id },
      { status: 400 },
    );
  }

  try {
    // Get the backend API URL from environment
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    // Make request to backend
    const response = await fetch(`${backendUrl}/events/${id}/brief`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Forward authorization header if present
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization")!,
        }),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Failed to generate event brief" },
        { status: response.status },
      );
    }

    // Get the PDF buffer
    const pdfBuffer = await response.arrayBuffer();

    // Get filename from backend response or create default
    const contentDisposition = response.headers.get("content-disposition");
    let filename = `event-${id}-brief.pdf`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
        // Add cache headers for performance
        "Cache-Control": "public, max-age=300", // 5 minutes
      },
    });
  } catch (error) {
    console.error("❌ Frontend API - Error downloading event brief:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
