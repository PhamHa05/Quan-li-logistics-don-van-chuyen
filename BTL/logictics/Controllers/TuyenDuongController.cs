using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Logistics.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TuyenDuongController : ControllerBase
    {
        private readonly ITuyenDuongBusiness _tuyenDuongBusiness;

        public TuyenDuongController(ITuyenDuongBusiness tuyenDuongBusiness)
        {
            _tuyenDuongBusiness = tuyenDuongBusiness;
        }

        [HttpGet("get-by-id/{id}")]
        public IActionResult GetDatabyID(long id)
        {
            var tuyenDuong = _tuyenDuongBusiness.GetDatabyID(id);
            if (tuyenDuong == null)
            {
                return NotFound();
            }
            return Ok(tuyenDuong);
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] TuyenDuongModel model)
        {
            var result = _tuyenDuongBusiness.Create(model);
            return Ok(new { success = result });
        }

        [HttpPut("update")]
        public IActionResult Update([FromBody] TuyenDuongModel model)
        {
            var result = _tuyenDuongBusiness.Update(model);
            return Ok(new { success = result });
        }

        // Các controller khác cho DiemGiaoHang, SuKienTrangThai...
    }
}