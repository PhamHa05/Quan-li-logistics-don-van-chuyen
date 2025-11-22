using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;
using System;

namespace Logistics.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiemGiaoHangController : ControllerBase
    {
        private readonly IDiemGiaoHangBusiness _business;

        public DiemGiaoHangController(IDiemGiaoHangBusiness business)
        {
            _business = business;
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] DiemGiaoHangModel model)
        {
            try
            {
                var result = _business.Create(model);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update")]
        public IActionResult Update([FromBody] DiemGiaoHangModel model)
        {
            try
            {
                var result = _business.Update(model);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("delete/{id}")]
        public IActionResult Delete(long id)
        {
            try
            {
                var result = _business.Delete(id);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("tuyen-duong/{tuyenDuongId}")]
        public IActionResult GetByTuyenDuongId(long tuyenDuongId)
        {
            try
            {
                var data = _business.GetByTuyenDuongId(tuyenDuongId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("search")]
        public IActionResult Search([FromBody] DiemGiaoHangSearchRequest request)
        {
            try
            {
                var data = _business.GetByTuyenDuongId(request.IdTuyenDuong);
                return Ok(new { TotalItems = data.Count, Data = data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

// Search request model
public class DiemGiaoHangSearchRequest
{
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public long IdTuyenDuong { get; set; }
}
