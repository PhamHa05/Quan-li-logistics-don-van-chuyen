namespace Logistics.API.Models.Request
{
    public class NguoiDungSearchRequest
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public string HoTen { get; set; }
        public string TenDangNhap { get; set; }
    }
}
