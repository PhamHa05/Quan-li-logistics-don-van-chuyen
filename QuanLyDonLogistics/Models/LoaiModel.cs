using System.ComponentModel.DataAnnotations;

namespace QuanLyDonLogistics.Models
{
    public class LoaiModel
    {
        [Required]
        [MaxLength(50)]
        public string TenLoai { get; set; }
    }
}
