using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Logistics.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuKienTrangThaiController : ControllerBase
    {
        private readonly ISuKienTrangThaiBusiness _suKienTrangThaiBusiness;
        private readonly IDonVanChuyenBusiness _donVanChuyenBusiness; // Inject thêm để cập nhật trạng thái đơn hàng

        public SuKienTrangThaiController(ISuKienTrangThaiBusiness suKienTrangThaiBusiness, IDonVanChuyenBusiness donVanChuyenBusiness)
        {
            _suKienTrangThaiBusiness = suKienTrangThaiBusiness;
            _donVanChuyenBusiness = donVanChuyenBusiness;
        }

        [HttpGet("get-history/{donVanChuyenId}")]
        public IActionResult GetHistoryByDonVanChuyenID(long donVanChuyenId)
        {
            var history = _suKienTrangThaiBusiness.GetHistoryByDonVanChuyenID(donVanChuyenId);
            return Ok(history);
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] SuKienTrangThaiModel model)
        {
            // Logic nghiệp vụ: Khi tạo một sự kiện mới, cập nhật luôn trạng thái chính của đơn hàng
            var result = _suKienTrangThaiBusiness.Create(model);
            if (result)
            {
                var donHang = _donVanChuyenBusiness.GetDatabyID(model.id_don_van_chuyen);
                if (donHang != null)
                {
                    donHang.trang_thai = model.trang_thai_moi;
                    _donVanChuyenBusiness.Update(donHang); // Cập nhật lại trạng thái
                }
            }
            return Ok(new { success = result });
        }
    }
}