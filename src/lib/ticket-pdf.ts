import { apiClient } from "./api";

/**
 * Downloads a ticket PDF from the backend
 * @param ticketId - The ticket ID
 */
export async function downloadTicketPDF(ticketId: string): Promise<void> {
  try {
    // Use the API client to fetch the PDF blob
    const blob = await apiClient.get<Blob>(`/tickets/${ticketId}/pdf`, {
      responseType: "blob",
    });

    if (!blob) {
      throw new Error("No PDF data received from server");
    }

    // Verify it's actually a PDF blob
    if (blob.type !== "application/pdf" && blob.size > 0) {
      // Sometimes the content-type might not be set correctly, but if we have data, proceed
      console.warn("Received blob may not be a PDF, but proceeding with download");
    }

    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-${ticketId}.pdf`;
    link.style.display = "none"; // Hide the link
    document.body.appendChild(link);
    link.click();
    
    // Clean up after a short delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error: any) {
    console.error("Failed to download ticket PDF:", error);
    
    // Provide user-friendly error message
    const errorMessage = error?.message || error?.error?.message || "Failed to download ticket PDF. Please try again.";
    alert(errorMessage);
    throw error;
  }
}

