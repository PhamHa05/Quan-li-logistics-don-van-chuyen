namespace Logistics.API.Models.Request
{
    public class DonVanChuyenSearchRequest
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public string MaVanDon { get; set; }
        public string TrangThai { get; set; }
    }
}
