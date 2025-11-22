using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;
using System;

namespace Logistics.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GiaoDichCODController : ControllerBase
    {
        private readonly IGiaoDichCODBusiness _business;

        public GiaoDichCODController(IGiaoDichCODBusiness business)
        {
            _business = business;
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] GiaoDichCODModel model)
        {
            try
            {
                bool result = _business.Create(model);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update")]
        public IActionResult Update([FromBody] GiaoDichCODModel model)
        {
            try
            {
                bool result = _business.Update(model);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("don-van-chuyen/{id}")]
        public IActionResult GetByDonVanChuyenId(long id)
        {
            try
            {
                var data = _business.GetByDonVanChuyenId(id);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var data = _business.GetAll();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("submit-cod/{idDonVanChuyen}")]
        public IActionResult SubmitCOD(long idDonVanChuyen)
        {
            try
            {
                // Lấy giao dịch COD của đơn hàng
                var codTransaction = _business.GetByDonVanChuyenId(idDonVanChuyen);
                if (codTransaction == null || codTransaction.Count == 0)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy giao dịch COD" });
                }

                var cod = codTransaction[0];
                
                // Cập nhật trạng thái đã nộp
                cod.TrangThai = "Đã nộp";
                cod.ThoiGianNop = DateTime.Now;
                
                bool result = _business.Update(cod);
                
                if (result)
                {
                    return Ok(new { success = true, message = "Nộp COD thành công" });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Không thể cập nhật trạng thái COD" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
