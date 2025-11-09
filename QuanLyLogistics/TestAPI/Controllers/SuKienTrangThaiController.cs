using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Logistics.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuKienTrangThaiController : ControllerBase
    {
        private readonly ISuKienTrangThaiBusiness _business;

        public SuKienTrangThaiController(ISuKienTrangThaiBusiness business)
        {
            _business = business;
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] SuKienTrangThaiModel model)
        {
            try
            {
                bool result = _business.Create(model);
                if (result)
                    return Ok(new { message = "Thêm sự kiện trạng thái thành công!" });
                return BadRequest(new { message = "Không thể thêm sự kiện trạng thái!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet("history/{idDonVanChuyen}")]
        public IActionResult GetHistory(long idDonVanChuyen)
        {
            try
            {
                var data = _business.GetHistoryByDonVanChuyenID(idDonVanChuyen);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }
    }
}
