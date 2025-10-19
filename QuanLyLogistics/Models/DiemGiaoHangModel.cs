namespace Models
{
    public class DiemGiaoHangModel
    {
        public long Id { get; set; }
        public long IdTuyenDuong { get; set; }
        public long IdDonVanChuyen { get; set; }
        public int? ThuTuDung { get; set; }
        public TimeSpan? ThoiGianDuKien { get; set; }
        public TimeSpan? ThoiGianThucTe { get; set; }
        public string TrangThai { get; set; }
    }
}
