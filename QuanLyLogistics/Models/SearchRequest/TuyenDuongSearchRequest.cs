namespace TestAPI.SearchRequest
{
    public class TuyenDuongSearchRequest
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? MaTuyen { get; set; }
        public long? IdTaiXe { get; set; }
    }
}
