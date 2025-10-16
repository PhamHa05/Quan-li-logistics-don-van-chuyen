using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Logistics.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiemGiaoHangController : ControllerBase
    {
        private readonly IDiemGiaoHangBusiness _diemGiaoHangBusiness;

        public DiemGiaoHangController(IDiemGiaoHangBusiness diemGiaoHangBusiness)
        {
            _diemGiaoHangBusiness = diemGiaoHangBusiness;
        }

        [HttpGet("get-by-tuyenduong/{tuyenDuongId}")]
        public IActionResult GetByTuyenDuongID(long tuyenDuongId)
        {
            var data = _diemGiaoHangBusiness.GetByTuyenDuongID(tuyenDuongId);
            return Ok(data);
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] DiemGiaoHangModel model)
        {
            var result = _diemGiaoHangBusiness.Create(model);
            return Ok(new { success = result });
        }

        [HttpPut("update")]
        public IActionResult Update([FromBody] DiemGiaoHangModel model)
        {
            var result = _diemGiaoHangBusiness.Update(model);
            return Ok(new { success = result });
        }
    }
}