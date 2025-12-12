import { apiClient } from "./api";

export interface DashboardStats {
  ticketsSoldToday: number;
  grossRevenue: number;
  outstandingPayouts: number;
  checkInRate: number;
  upcomingEvents: number;
  totalEvents: number;
}

export interface SalesTrendData {
  date: string;
  count: number;
  revenue: number;
}

export interface OrganiserAnalytics {
  totalEvents: number;
  upcomingEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
}

export interface EventAnalytics {
  ticketsSold: number;
  ticketsCheckedIn: number;
  checkInRate: number;
  revenue: number;
  paymentMethods: Array<{
    method: string;
    total: number;
  }>;
}

export interface SalesAnalyticsData {
  salesOverTime: Array<{
    date: string;
    sales: number;
    tickets: number;
  }>;
  conversionFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  revenueByTicketType: Array<{
    type: string;
    revenue: number;
    count: number;
  }>;
  revenueByPaymentMethod: Array<{
    method: string;
    revenue: number;
    percentage: number;
    count: number;
  }>;
  hourlySales: Array<{
    hour: string;
    sales: number;
  }>;
}

export interface CustomerInsightsData {
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
  ageDistribution: Array<{
    age: string;
    count: number;
    percentage: number;
  }>;
  locationDistribution: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
  topSpenders: Array<{
    customer: string;
    orders: number;
    total: number;
    avgOrder: number;
  }>;
  customerLifetime: Array<{
    period: string;
    active: number;
    new: number;
    churned: number;
  }>;
}

export interface EventPerformanceData {
  eventPerformance: Array<{
    event: string;
    views: number;
    purchases: number;
    conversion: number;
    revenue: number;
    checkInRate: number;
  }>;
  marketingAttribution: Array<{
    channel: string;
    conversions: number;
    revenue: number;
    roi: number;
  }>;
  checkInTrends: Array<{
    date: string;
    checkedIn: number;
    expected: number;
    rate: number;
  }>;
  seatMapHeatmap: Array<{
    section: string;
    demand: number;
    revenue: number;
  }>;
}

export interface FinanceReportsData {
  revenueBreakdown: Array<{
    month: string;
    gross: number;
    net: number;
    fees: number;
  }>;
  taxBreakdown: Array<{
    type: string;
    amount: number;
    percentage: number;
  }>;
  settlementSchedule: Array<{
    period: string;
    settled: number;
    pending: number;
  }>;
  feeBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  revenueByEvent: Array<{
    event: string;
    revenue: number;
    net: number;
  }>;
}

/**
 * Get dashboard statistics for an organiser
 */
export async function getDashboardStats(organiserId: string): Promise<DashboardStats> {
  return apiClient.get<DashboardStats>(`/organisers/${organiserId}/dashboard/stats`);
}

/**
 * Get organiser analytics
 */
export async function getOrganiserAnalytics(organiserId: string): Promise<OrganiserAnalytics> {
  return apiClient.get<OrganiserAnalytics>(`/analytics/organisers/${organiserId}`);
}

/**
 * Get sales trend data for an organiser
 */
export async function getSalesTrend(
  organiserId: string,
  days: number = 30
): Promise<SalesTrendData[]> {
  return apiClient.get<SalesTrendData[]>(`/analytics/organisers/${organiserId}/sales-trend?days=${days}`);
}

/**
 * Get event analytics
 */
export async function getEventAnalytics(
  eventId: string,
  organiserId?: string
): Promise<EventAnalytics> {
  const query = organiserId ? `?organiserId=${organiserId}` : "";
  return apiClient.get<EventAnalytics>(`/analytics/events/${eventId}${query}`);
}

/**
 * Get comprehensive sales analytics data
 * Note: This is a placeholder - backend may need to be extended to provide all this data
 */
export async function getSalesAnalytics(
  organiserId: string,
  timeRange: string = "6months",
  eventId?: string
): Promise<SalesAnalyticsData> {
  // For now, we'll use the sales trend and build the data structure
  // In the future, this should be a dedicated endpoint
  const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : timeRange === "3months" ? 90 : timeRange === "6months" ? 180 : 365;
  const salesTrend = await getSalesTrend(organiserId, days);
  
  // Transform sales trend into sales over time format
  const salesOverTime = salesTrend.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short" }),
    sales: item.revenue,
    tickets: item.count,
  }));

  // For now, return mock structure - backend needs to be extended
  // TODO: Create dedicated endpoint for comprehensive sales analytics
  return {
    salesOverTime,
    conversionFunnel: [], // TODO: Backend needs to provide this
    revenueByTicketType: [], // TODO: Backend needs to provide this
    revenueByPaymentMethod: [], // TODO: Backend needs to provide this
    hourlySales: [], // TODO: Backend needs to provide this
  };
}

/**
 * Get customer insights data
 * Note: This is a placeholder - backend needs to be extended
 */
export async function getCustomerInsights(
  organiserId: string,
  timeRange: string = "30days"
): Promise<CustomerInsightsData> {
  // TODO: Create dedicated endpoint for customer insights
  return {
    customerSegments: [],
    ageDistribution: [],
    locationDistribution: [],
    topSpenders: [],
    customerLifetime: [],
  };
}

/**
 * Get event performance data
 * Note: This is a placeholder - backend needs to be extended
 */
export async function getEventPerformance(
  organiserId: string,
  eventId?: string
): Promise<EventPerformanceData> {
  // TODO: Create dedicated endpoint for event performance
  return {
    eventPerformance: [],
    marketingAttribution: [],
    checkInTrends: [],
    seatMapHeatmap: [],
  };
}

/**
 * Get finance reports data
 * Note: This is a placeholder - backend needs to be extended
 */
export async function getFinanceReports(
  organiserId: string,
  timeRange: string = "6months"
): Promise<FinanceReportsData> {
  // TODO: Create dedicated endpoint for finance reports
  return {
    revenueBreakdown: [],
    taxBreakdown: [],
    settlementSchedule: [],
    feeBreakdown: [],
    revenueByEvent: [],
  };
}

