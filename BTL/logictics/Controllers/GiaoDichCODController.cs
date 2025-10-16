using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;
using System;

namespace Logistics.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GiaoDichCODController : ControllerBase
    {
        private readonly IGiaoDichCODBusiness _giaoDichCODBusiness;

        public GiaoDichCODController(IGiaoDichCODBusiness giaoDichCODBusiness)
        {
            _giaoDichCODBusiness = giaoDichCODBusiness;
        }

        /// <summary>
        /// Lấy thông tin giao dịch COD của một đơn vận chuyển.
        /// </summary>
        /// <param name="donVanChuyenId">ID của đơn vận chuyển</param>
        [HttpGet("get-by-donvanchuyen/{donVanChuyenId}")]
        public IActionResult GetByDonVanChuyenID(long donVanChuyenId)
        {
            try
            {
                var giaoDich = _giaoDichCODBusiness.GetByDonVanChuyenID(donVanChuyenId);
                if (giaoDich == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin giao dịch COD cho đơn hàng này." });
                }
                return Ok(giaoDich);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi hệ thống.", error = ex.Message });
            }
        }

        /// <summary>
        /// Tạo một bản ghi giao dịch COD khi tạo đơn hàng có thu hộ.
        /// </summary>
        [HttpPost("create")]
        public IActionResult Create([FromBody] GiaoDichCODModel model)
        {
            try
            {
                var result = _giaoDichCODBusiness.Create(model);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật trạng thái giao dịch COD (ví dụ: đã thu tiền, đã đối soát).
        /// </summary>
        [HttpPut("update")]
        public IActionResult Update([FromBody] GiaoDichCODModel model)
        {
            try
            {
                var result = _giaoDichCODBusiness.Update(model);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}