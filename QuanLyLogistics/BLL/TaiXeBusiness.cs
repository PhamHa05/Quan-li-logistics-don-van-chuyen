using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BLL
{
    public class TaiXeBusiness : ITaiXeBusiness
    {
        private ITaiXeRepository _res;
        private IDonVanChuyenRepository _donVanChuyenRepo;
        private IGiaoDichCODRepository _codRepo;

        public TaiXeBusiness(ITaiXeRepository res, IDonVanChuyenRepository donVanChuyenRepo, IGiaoDichCODRepository codRepo)
        {
            _res = res;
            _donVanChuyenRepo = donVanChuyenRepo;
            _codRepo = codRepo;
        }

        public bool Create(TaiXeModel model) => _res.Create(model);
        public bool Update(TaiXeModel model) => _res.Update(model);
        public bool Delete(long id) => _res.Delete(id);
        public TaiXeModel GetDatabyID(long id) => _res.GetDatabyID(id);
        public List<TaiXeModel> Search(int pageIndex, int pageSize, out long total, string hoTen, string soDienThoai)
            => _res.Search(pageIndex, pageSize, out total, hoTen, soDienThoai);

        public TaiXeDashboardStatsModel GetDashboardStats(long idTaiXe)
        {
            var stats = new TaiXeDashboardStatsModel();

            // Lấy tất cả đơn hàng của tài xế
            var allOrders = _donVanChuyenRepo.GetByIdTaiXe(idTaiXe);

            if (allOrders == null || !allOrders.Any())
            {
                return stats; // Return empty stats
            }

            var today = DateTime.Today;
            var weekAgo = today.AddDays(-7);
            var monthAgo = today.AddMonths(-1);

            // Đơn hàng hôm nay
            var todayOrders = allOrders.Where(o => o.ThoiGianTao.Date == today).ToList();

            // Thống kê tổng quan
            stats.TodayOrders = todayOrders.Count;
            stats.DeliveringOrders = allOrders.Count(o => o.TrangThai == "Đang giao");
            stats.CompletedOrders = todayOrders.Count(o => o.TrangThai == "Đã giao");
            stats.CodCollected = todayOrders.Where(o => o.TrangThai == "Đã giao").Sum(o => o.TienThuHo);
            stats.TotalOrders = allOrders.Count;
            stats.PendingOrders = allOrders.Count(o => o.TrangThai == "Chờ lấy hàng" || o.TrangThai == "Đang giao");

            // Thống kê hôm nay
            stats.StatsToday.Total = todayOrders.Count;
            stats.StatsToday.Delivered = todayOrders.Count(o => o.TrangThai == "Đã giao");
            stats.StatsToday.Failed = todayOrders.Count(o => o.TrangThai == "Thất bại");
            stats.StatsToday.Cod = todayOrders.Where(o => o.TrangThai == "Đã giao").Sum(o => o.TienThuHo);

            // Thống kê tuần này
            var weekOrders = allOrders.Where(o => o.ThoiGianTao >= weekAgo).ToList();
            stats.StatsWeek.Total = weekOrders.Count;
            stats.StatsWeek.Success = weekOrders.Count(o => o.TrangThai == "Đã giao");
            stats.StatsWeek.Failed = weekOrders.Count(o => o.TrangThai == "Thất bại");
            stats.StatsWeek.Cod = weekOrders.Where(o => o.TrangThai == "Đã giao").Sum(o => o.TienThuHo);
            stats.StatsWeek.SuccessRate = weekOrders.Count > 0 
                ? (int)Math.Round((double)stats.StatsWeek.Success / weekOrders.Count * 100) 
                : 0;

            // Thống kê tháng này
            var monthOrders = allOrders.Where(o => o.ThoiGianTao >= monthAgo).ToList();
            stats.StatsMonth.Total = monthOrders.Count;
            stats.StatsMonth.Success = monthOrders.Count(o => o.TrangThai == "Đã giao");
            stats.StatsMonth.Failed = monthOrders.Count(o => o.TrangThai == "Thất bại");
            stats.StatsMonth.Cod = monthOrders.Where(o => o.TrangThai == "Đã giao").Sum(o => o.TienThuHo);
            stats.StatsMonth.SuccessRate = monthOrders.Count > 0 
                ? (int)Math.Round((double)stats.StatsMonth.Success / monthOrders.Count * 100) 
                : 0;

            // Thống kê COD
            var completedOrders = allOrders.Where(o => o.TrangThai == "Đã giao").ToList();
            stats.CodStats.TotalCollected = completedOrders.Sum(o => o.TienThuHo);

            // Lấy thông tin COD đã nộp từ GiaoDichCOD
            try
            {
                var completedOrderIds = completedOrders.Select(o => o.Id).ToList();
                var codTransactions = completedOrderIds
                    .Select(id => _codRepo.GetByDonVanChuyenId(id))
                    .Where(cod => cod != null)
                    .ToList();

                stats.CodStats.Submitted = codTransactions
                    .Where(cod => cod.DaDoiSoat)
                    .Sum(cod => cod.SoTienThucTe ?? 0);
                
                stats.CodStats.NotSubmitted = stats.CodStats.TotalCollected - stats.CodStats.Submitted;
            }
            catch
            {
                // Nếu không lấy được thông tin COD, giả sử chưa nộp
                stats.CodStats.NotSubmitted = stats.CodStats.TotalCollected;
                stats.CodStats.Submitted = 0;
            }

            return stats;
        }
    }
}
