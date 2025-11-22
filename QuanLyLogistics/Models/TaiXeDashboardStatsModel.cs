using System;

namespace Models
{
    public class TaiXeDashboardStatsModel
    {
        // Thống kê tổng quan
        public int TodayOrders { get; set; }
        public int DeliveringOrders { get; set; }
        public int CompletedOrders { get; set; }
        public decimal CodCollected { get; set; }
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }

        // Thống kê hôm nay
        public StatsDetail StatsToday { get; set; }

        // Thống kê tuần này
        public StatsDetail StatsWeek { get; set; }

        // Thống kê tháng này
        public StatsDetail StatsMonth { get; set; }

        // Thống kê COD
        public CodStatsDetail CodStats { get; set; }

        public TaiXeDashboardStatsModel()
        {
            StatsToday = new StatsDetail();
            StatsWeek = new StatsDetail();
            StatsMonth = new StatsDetail();
            CodStats = new CodStatsDetail();
        }
    }

    public class StatsDetail
    {
        public int Total { get; set; }
        public int Delivered { get; set; }
        public int Success { get; set; }
        public int Failed { get; set; }
        public decimal Cod { get; set; }
        public int SuccessRate { get; set; }
    }

    public class CodStatsDetail
    {
        public decimal TotalCollected { get; set; }
        public decimal NotSubmitted { get; set; }
        public decimal Submitted { get; set; }
    }
}
