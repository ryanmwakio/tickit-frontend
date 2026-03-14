import { apiClient } from "./api";

export interface TicketDesignConfig {
  // Layout settings
  layout?: "portrait" | "landscape";
  width?: number; // in mm or pixels
  height?: number; // in mm or pixels

  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: {
    type: "linear" | "radial";
    colors: string[];
    direction?: string;
  };

  // Header section
  header?: {
    enabled: boolean;
    height?: number;
    backgroundColor?: string;
    logo?: {
      url: string;
      position: "left" | "center" | "right";
      size?: number;
    };
    text?: {
      content: string;
      fontSize?: number;
      fontFamily?: string;
      color?: string;
      fontWeight?: "normal" | "bold";
      position: "left" | "center" | "right";
    };
  };

  // Event info section
  eventInfo?: {
    enabled: boolean;
    title?: {
      enabled: boolean;
      fontSize?: number;
      fontFamily?: string;
      color?: string;
      fontWeight?: "normal" | "bold";
    };
    date?: {
      enabled: boolean;
      format?: string;
      fontSize?: number;
      color?: string;
    };
    time?: {
      enabled: boolean;
      format?: string;
      fontSize?: number;
      color?: string;
    };
    venue?: {
      enabled: boolean;
      fontSize?: number;
      color?: string;
    };
  };

  // QR Code section
  qrCode?: {
    enabled: boolean;
    size?: number;
    position?: "left" | "center" | "right" | "bottom";
    margin?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  };

  // Ticket details section
  ticketDetails?: {
    enabled: boolean;
    ticketNumber?: {
      enabled: boolean;
      label?: string;
      fontSize?: number;
      color?: string;
    };
    ticketType?: {
      enabled: boolean;
      label?: string;
      fontSize?: number;
      color?: string;
    };
    price?: {
      enabled: boolean;
      label?: string;
      fontSize?: number;
      color?: string;
      format?: string;
    };
    seatInfo?: {
      enabled: boolean;
      section?: {
        enabled: boolean;
        label?: string;
      };
      row?: {
        enabled: boolean;
        label?: string;
      };
      seat?: {
        enabled: boolean;
        label?: string;
      };
      fontSize?: number;
      color?: string;
    };
  };

  // Footer section
  footer?: {
    enabled: boolean;
    height?: number;
    backgroundColor?: string;
    text?: string;
    fontSize?: number;
    color?: string;
    links?: Array<{
      text: string;
      url: string;
    }>;
  };

  // Border
  border?: {
    enabled: boolean;
    width?: number;
    color?: string;
    style?: "solid" | "dashed" | "dotted";
    radius?: number;
  };

  // Watermark
  watermark?: {
    enabled: boolean;
    text?: string;
    image?: string;
    opacity?: number;
    position?:
      | "center"
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right";
  };
}

export interface TicketDesign {
  id: string;
  organiserId: string;
  eventId?: string;
  name: string;
  description?: string;
  designConfig: TicketDesignConfig;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDesignDto {
  name: string;
  description?: string;
  designConfig: TicketDesignConfig;
  eventId?: string;
  isDefault?: boolean;
}

export interface UpdateTicketDesignDto {
  name?: string;
  description?: string;
  designConfig?: TicketDesignConfig;
  eventId?: string;
  isDefault?: boolean;
}

/**
 * Create a new ticket design for an organiser
 */
export async function createTicketDesign(
  organiserId: string,
  data: CreateTicketDesignDto,
): Promise<TicketDesign> {
  return apiClient.post<TicketDesign>(
    `/ticket-designs/organisers/${organiserId}`,
    data,
  );
}

/**
 * Get all ticket designs for an organiser
 */
export async function getTicketDesigns(
  organiserId: string,
  eventId?: string,
): Promise<TicketDesign[]> {
  const params = new URLSearchParams();
  if (eventId) {
    params.set("eventId", eventId);
  }

  const url = `/ticket-designs/organisers/${organiserId}${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<TicketDesign[]>(url);
}

/**
 * Get a single ticket design by ID
 */
export async function getTicketDesign(id: string): Promise<TicketDesign> {
  return apiClient.get<TicketDesign>(`/ticket-designs/${id}`);
}

/**
 * Update a ticket design
 */
export async function updateTicketDesign(
  id: string,
  data: UpdateTicketDesignDto,
): Promise<TicketDesign> {
  return apiClient.put<TicketDesign>(`/ticket-designs/${id}`, data);
}

/**
 * Set a ticket design as default for the organiser
 */
export async function setDefaultTicketDesign(
  id: string,
): Promise<TicketDesign> {
  return apiClient.post<TicketDesign>(`/ticket-designs/${id}/set-default`, {});
}

/**
 * Delete a ticket design
 */
export async function deleteTicketDesign(id: string): Promise<void> {
  return apiClient.delete<void>(`/ticket-designs/${id}`);
}

/**
 * Get default ticket design configuration for new designs
 */
export function getDefaultTicketDesignConfig(): TicketDesignConfig {
  return {
    layout: "portrait",
    width: 300,
    height: 450,
    backgroundColor: "#ffffff",

    header: {
      enabled: true,
      height: 80,
      backgroundColor: "#1f2937",
      text: {
        content: "TICKET",
        fontSize: 24,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: "bold",
        position: "center",
      },
    },

    eventInfo: {
      enabled: true,
      title: {
        enabled: true,
        fontSize: 18,
        fontFamily: "Inter",
        color: "#1f2937",
        fontWeight: "bold",
      },
      date: {
        enabled: true,
        format: "MMM DD, YYYY",
        fontSize: 14,
        color: "#64748b",
      },
      time: {
        enabled: true,
        format: "h:mm A",
        fontSize: 14,
        color: "#64748b",
      },
      venue: {
        enabled: true,
        fontSize: 14,
        color: "#64748b",
      },
    },

    qrCode: {
      enabled: true,
      size: 80,
      position: "right",
      margin: 20,
      errorCorrectionLevel: "M",
    },

    ticketDetails: {
      enabled: true,
      ticketNumber: {
        enabled: true,
        label: "Ticket #",
        fontSize: 12,
        color: "#64748b",
      },
      ticketType: {
        enabled: true,
        label: "Type",
        fontSize: 12,
        color: "#64748b",
      },
      price: {
        enabled: true,
        label: "Price",
        fontSize: 12,
        color: "#64748b",
        format: "KES {amount}",
      },
      seatInfo: {
        enabled: false,
        section: {
          enabled: true,
          label: "Section",
        },
        row: {
          enabled: true,
          label: "Row",
        },
        seat: {
          enabled: true,
          label: "Seat",
        },
        fontSize: 12,
        color: "#64748b",
      },
    },

    footer: {
      enabled: true,
      height: 40,
      backgroundColor: "#f8fafc",
      text: "Valid only for the specified event. Non-transferable.",
      fontSize: 10,
      color: "#64748b",
    },

    border: {
      enabled: true,
      width: 2,
      color: "#e2e8f0",
      style: "solid",
      radius: 8,
    },

    watermark: {
      enabled: false,
      text: "TICKIT",
      opacity: 0.1,
      position: "center",
    },
  };
}

/**
 * Predefined ticket design templates
 */
export const ticketDesignTemplates = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean corporate design with subtle gradients",
    config: {
      ...getDefaultTicketDesignConfig(),
      width: 350,
      height: 500,
      backgroundColor: "#ffffff",
      backgroundGradient: {
        type: "linear" as const,
        colors: ["#ffffff", "#f8fafc", "#f1f5f9"],
        direction: "to-br",
      },
      header: {
        enabled: true,
        height: 85,
        backgroundColor: "transparent",
        text: {
          content: "ADMIT ONE",
          fontSize: 16,
          fontFamily: "Inter",
          color: "#475569",
          fontWeight: "bold",
          position: "center",
        },
      },
      eventInfo: {
        enabled: true,
        title: {
          enabled: true,
          fontSize: 22,
          fontFamily: "Inter",
          color: "#1e293b",
          fontWeight: "bold",
        },
        date: {
          enabled: true,
          format: "MMMM DD, YYYY",
          fontSize: 15,
          color: "#64748b",
        },
        time: {
          enabled: true,
          format: "h:mm A",
          fontSize: 15,
          color: "#64748b",
        },
        venue: {
          enabled: true,
          fontSize: 14,
          color: "#64748b",
        },
      },
      qrCode: {
        enabled: true,
        size: 85,
        position: "right",
        margin: 24,
        errorCorrectionLevel: "M",
      },
      border: {
        enabled: true,
        width: 1,
        color: "#e2e8f0",
        style: "solid",
        radius: 16,
      },
      watermark: {
        enabled: true,
        text: "TICKIT",
        opacity: 0.03,
        position: "center",
      },
    },
  },
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    description: "Contemporary design with vibrant gradients",
    config: {
      ...getDefaultTicketDesignConfig(),
      width: 340,
      height: 480,
      backgroundColor: "#ffffff",
      backgroundGradient: {
        type: "linear" as const,
        colors: ["#667eea", "#764ba2", "#f093fb"],
        direction: "to-br",
      },
      header: {
        enabled: true,
        height: 90,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        text: {
          content: "EVENT TICKET",
          fontSize: 18,
          fontFamily: "Inter",
          color: "#ffffff",
          fontWeight: "bold",
          position: "center",
        },
      },
      eventInfo: {
        enabled: true,
        title: {
          enabled: true,
          fontSize: 24,
          fontFamily: "Inter",
          color: "#ffffff",
          fontWeight: "bold",
        },
        date: {
          enabled: true,
          format: "MMM DD, YYYY",
          fontSize: 16,
          color: "rgba(255, 255, 255, 0.9)",
        },
        time: {
          enabled: true,
          format: "h:mm A",
          fontSize: 16,
          color: "rgba(255, 255, 255, 0.9)",
        },
        venue: {
          enabled: true,
          fontSize: 14,
          color: "rgba(255, 255, 255, 0.85)",
        },
      },
      ticketDetails: {
        enabled: true,
        ticketNumber: {
          enabled: true,
          label: "Ticket #",
          fontSize: 12,
          color: "rgba(255, 255, 255, 0.8)",
        },
        ticketType: {
          enabled: true,
          label: "Type",
          fontSize: 12,
          color: "rgba(255, 255, 255, 0.8)",
        },
        price: {
          enabled: true,
          label: "Price",
          fontSize: 14,
          color: "#ffffff",
          format: "KES {amount}",
        },
      },
      qrCode: {
        enabled: true,
        size: 90,
        position: "right",
        margin: 20,
        errorCorrectionLevel: "M",
      },
      border: {
        enabled: true,
        width: 2,
        color: "rgba(255, 255, 255, 0.2)",
        style: "solid",
        radius: 20,
      },
      footer: {
        enabled: true,
        height: 50,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        text: "Valid only for the specified event date",
        fontSize: 11,
        color: "rgba(255, 255, 255, 0.7)",
      },
    },
  },
  {
    id: "luxury-dark",
    name: "Luxury Dark",
    description: "Premium black design with gold accents",
    config: {
      ...getDefaultTicketDesignConfig(),
      width: 360,
      height: 520,
      backgroundColor: "#111827",
      backgroundGradient: {
        type: "linear" as const,
        colors: ["#111827", "#1f2937", "#374151"],
        direction: "to-br",
      },
      header: {
        enabled: true,
        height: 100,
        backgroundColor: "#000000",
        text: {
          content: "EXCLUSIVE ACCESS",
          fontSize: 20,
          fontFamily: "Inter",
          color: "#fbbf24",
          fontWeight: "bold",
          position: "center",
        },
      },
      eventInfo: {
        enabled: true,
        title: {
          enabled: true,
          fontSize: 26,
          fontFamily: "Inter",
          color: "#f8fafc",
          fontWeight: "bold",
        },
        date: {
          enabled: true,
          format: "MMMM DD, YYYY",
          fontSize: 16,
          color: "#d1d5db",
        },
        time: {
          enabled: true,
          format: "h:mm A",
          fontSize: 16,
          color: "#d1d5db",
        },
        venue: {
          enabled: true,
          fontSize: 15,
          color: "#9ca3af",
        },
      },
      ticketDetails: {
        enabled: true,
        ticketNumber: {
          enabled: true,
          label: "Ticket #",
          fontSize: 13,
          color: "#fbbf24",
        },
        ticketType: {
          enabled: true,
          label: "Category",
          fontSize: 13,
          color: "#d1d5db",
        },
        price: {
          enabled: true,
          label: "Price",
          fontSize: 16,
          color: "#fbbf24",
          format: "KES {amount}",
        },
      },
      qrCode: {
        enabled: true,
        size: 95,
        position: "right",
        margin: 25,
        errorCorrectionLevel: "H",
      },
      border: {
        enabled: true,
        width: 2,
        color: "#fbbf24",
        style: "solid",
        radius: 18,
      },
      footer: {
        enabled: true,
        height: 55,
        backgroundColor: "rgba(251, 191, 36, 0.1)",
        text: "Premium Experience • Valid for event date only",
        fontSize: 11,
        color: "#d1d5db",
      },
      watermark: {
        enabled: true,
        text: "VIP",
        opacity: 0.05,
        position: "center",
      },
    },
  },
  {
    id: "festival-vibrant",
    name: "Festival Vibrant",
    description: "Colorful design perfect for music festivals and concerts",
    config: {
      ...getDefaultTicketDesignConfig(),
      width: 380,
      height: 480,
      backgroundColor: "#ff6b6b",
      backgroundGradient: {
        type: "linear" as const,
        colors: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3"],
        direction: "to-br",
      },
      header: {
        enabled: true,
        height: 95,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        text: {
          content: "🎵 MUSIC FESTIVAL 🎵",
          fontSize: 22,
          fontFamily: "Inter",
          color: "#ffffff",
          fontWeight: "bold",
          position: "center",
        },
      },
      eventInfo: {
        enabled: true,
        title: {
          enabled: true,
          fontSize: 28,
          fontFamily: "Inter",
          color: "#ffffff",
          fontWeight: "bold",
        },
        date: {
          enabled: true,
          format: "MMM DD",
          fontSize: 20,
          color: "#ffffff",
        },
        time: {
          enabled: true,
          format: "h:mm A",
          fontSize: 18,
          color: "rgba(255, 255, 255, 0.95)",
        },
        venue: {
          enabled: true,
          fontSize: 16,
          color: "rgba(255, 255, 255, 0.9)",
        },
      },
      ticketDetails: {
        enabled: true,
        ticketNumber: {
          enabled: true,
          label: "🎫 Ticket #",
          fontSize: 14,
          color: "#ffffff",
        },
        ticketType: {
          enabled: true,
          label: "Pass Type",
          fontSize: 14,
          color: "#ffffff",
        },
        price: {
          enabled: true,
          label: "Price",
          fontSize: 18,
          color: "#ffffff",
          format: "KES {amount}",
        },
      },
      qrCode: {
        enabled: true,
        size: 100,
        position: "bottom",
        margin: 25,
        errorCorrectionLevel: "M",
      },
      border: {
        enabled: true,
        width: 4,
        color: "#ffffff",
        style: "solid",
        radius: 25,
      },
      footer: {
        enabled: true,
        height: 60,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        text: "Keep this ticket safe • No refunds • Age restrictions may apply",
        fontSize: 10,
        color: "rgba(255, 255, 255, 0.9)",
      },
    },
  },
  {
    id: "conference-clean",
    name: "Conference Clean",
    description: "Professional design ideal for business conferences",
    config: {
      ...getDefaultTicketDesignConfig(),
      width: 340,
      height: 460,
      backgroundColor: "#ffffff",
      backgroundGradient: {
        type: "linear" as const,
        colors: ["#ffffff", "#f8fafc"],
        direction: "to-b",
      },
      header: {
        enabled: true,
        height: 80,
        backgroundColor: "#2563eb",
        text: {
          content: "CONFERENCE PASS",
          fontSize: 16,
          fontFamily: "Inter",
          color: "#ffffff",
          fontWeight: "bold",
          position: "center",
        },
      },
      eventInfo: {
        enabled: true,
        title: {
          enabled: true,
          fontSize: 20,
          fontFamily: "Inter",
          color: "#1e40af",
          fontWeight: "bold",
        },
        date: {
          enabled: true,
          format: "MMMM DD, YYYY",
          fontSize: 14,
          color: "#475569",
        },
        time: {
          enabled: true,
          format: "h:mm A",
          fontSize: 14,
          color: "#475569",
        },
        venue: {
          enabled: true,
          fontSize: 13,
          color: "#64748b",
        },
      },
      ticketDetails: {
        enabled: true,
        ticketNumber: {
          enabled: true,
          label: "Registration #",
          fontSize: 12,
          color: "#64748b",
        },
        ticketType: {
          enabled: true,
          label: "Access Level",
          fontSize: 12,
          color: "#64748b",
        },
        price: {
          enabled: true,
          label: "Fee",
          fontSize: 14,
          color: "#2563eb",
          format: "KES {amount}",
        },
      },
      qrCode: {
        enabled: true,
        size: 80,
        position: "right",
        margin: 20,
        errorCorrectionLevel: "H",
      },
      border: {
        enabled: true,
        width: 1,
        color: "#e2e8f0",
        style: "solid",
        radius: 12,
      },
      footer: {
        enabled: true,
        height: 45,
        backgroundColor: "#f1f5f9",
        text: "Please bring valid ID • Networking materials included",
        fontSize: 10,
        color: "#64748b",
      },
      watermark: {
        enabled: true,
        text: "CONF",
        opacity: 0.02,
        position: "center",
      },
    },
  },
  {
    id: "sports-dynamic",
    name: "Sports Dynamic",
    description: "Energetic design perfect for sports events",
    config: {
      ...getDefaultTicketDesignConfig(),
      width: 370,
      height: 490,
      backgroundColor: "#16a34a",
      backgroundGradient: {
        type: "linear" as const,
        colors: ["#16a34a", "#15803d", "#166534"],
        direction: "to-br",
      },
      header: {
        enabled: true,
        height: 85,
        backgroundColor: "rgba(0, 0, 0, 0.15)",
        text: {
          content: "⚽ MATCH TICKET ⚽",
          fontSize: 19,
          fontFamily: "Inter",
          color: "#ffffff",
          fontWeight: "bold",
          position: "center",
        },
      },
      eventInfo: {
        enabled: true,
        title: {
          enabled: true,
          fontSize: 24,
          fontFamily: "Inter",
          color: "#ffffff",
          fontWeight: "bold",
        },
        date: {
          enabled: true,
          format: "MMM DD, YYYY",
          fontSize: 16,
          color: "rgba(255, 255, 255, 0.95)",
        },
        time: {
          enabled: true,
          format: "h:mm A",
          fontSize: 16,
          color: "rgba(255, 255, 255, 0.95)",
        },
        venue: {
          enabled: true,
          fontSize: 15,
          color: "rgba(255, 255, 255, 0.9)",
        },
      },
      ticketDetails: {
        enabled: true,
        ticketNumber: {
          enabled: true,
          label: "Ticket #",
          fontSize: 13,
          color: "rgba(255, 255, 255, 0.85)",
        },
        ticketType: {
          enabled: true,
          label: "Seat Category",
          fontSize: 13,
          color: "rgba(255, 255, 255, 0.85)",
        },
        price: {
          enabled: true,
          label: "Price",
          fontSize: 16,
          color: "#ffffff",
          format: "KES {amount}",
        },
        seatInfo: {
          enabled: true,
          section: {
            enabled: true,
            label: "Section",
          },
          row: {
            enabled: true,
            label: "Row",
          },
          seat: {
            enabled: true,
            label: "Seat",
          },
          fontSize: 13,
          color: "rgba(255, 255, 255, 0.9)",
        },
      },
      qrCode: {
        enabled: true,
        size: 90,
        position: "right",
        margin: 22,
        errorCorrectionLevel: "M",
      },
      border: {
        enabled: true,
        width: 3,
        color: "rgba(255, 255, 255, 0.3)",
        style: "solid",
        radius: 16,
      },
      footer: {
        enabled: true,
        height: 50,
        backgroundColor: "rgba(0, 0, 0, 0.15)",
        text: "No outside food or drinks • Gates open 1 hour early",
        fontSize: 10,
        color: "rgba(255, 255, 255, 0.8)",
      },
    },
  },
  {
    id: "minimal-modern",
    name: "Minimal Modern",
    description: "Ultra-clean design focusing on typography and whitespace",
    config: {
      ...getDefaultTicketDesignConfig(),
      width: 320,
      height: 440,
      backgroundColor: "#ffffff",
      header: {
        enabled: false,
      },
      eventInfo: {
        enabled: true,
        title: {
          enabled: true,
          fontSize: 28,
          fontFamily: "Inter",
          color: "#0f172a",
          fontWeight: "bold",
        },
        date: {
          enabled: true,
          format: "MMMM DD, YYYY",
          fontSize: 16,
          color: "#475569",
        },
        time: {
          enabled: true,
          format: "h:mm A",
          fontSize: 16,
          color: "#475569",
        },
        venue: {
          enabled: true,
          fontSize: 14,
          color: "#64748b",
        },
      },
      ticketDetails: {
        enabled: true,
        ticketNumber: {
          enabled: true,
          label: "",
          fontSize: 11,
          color: "#94a3b8",
        },
        ticketType: {
          enabled: true,
          label: "",
          fontSize: 13,
          color: "#475569",
        },
        price: {
          enabled: true,
          label: "",
          fontSize: 18,
          color: "#0f172a",
          format: "KES {amount}",
        },
      },
      qrCode: {
        enabled: true,
        size: 110,
        position: "bottom",
        margin: 30,
        errorCorrectionLevel: "M",
      },
      border: {
        enabled: true,
        width: 1,
        color: "#f1f5f9",
        style: "solid",
        radius: 8,
      },
      footer: {
        enabled: false,
      },
      watermark: {
        enabled: true,
        text: "T",
        opacity: 0.01,
        position: "center",
      },
    },
  },
];

/**
 * Validate ticket design configuration
 */
export function validateTicketDesignConfig(
  config: TicketDesignConfig,
): string[] {
  const errors: string[] = [];

  if (!config.layout || !["portrait", "landscape"].includes(config.layout)) {
    errors.push('Invalid layout. Must be "portrait" or "landscape".');
  }

  if (config.width && (config.width <= 0 || config.width > 1000)) {
    errors.push("Width must be between 1 and 1000.");
  }

  if (config.height && (config.height <= 0 || config.height > 1000)) {
    errors.push("Height must be between 1 and 1000.");
  }

  if (
    config.backgroundColor &&
    !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(config.backgroundColor)
  ) {
    errors.push("Invalid background color format. Must be a valid hex color.");
  }

  // Add more validation as needed

  return errors;
}
