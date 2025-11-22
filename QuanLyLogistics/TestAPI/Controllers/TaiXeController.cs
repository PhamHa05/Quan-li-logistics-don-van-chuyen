using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;
using TestAPI.SearchRequest;

namespace Logistics.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiXeController : ControllerBase
    {
        private readonly ITaiXeBusiness _taiXeBusiness;

        public TaiXeController(ITaiXeBusiness taiXeBusiness)
        {
            _taiXeBusiness = taiXeBusiness;
        }

        [HttpGet("get-by-id/{id}")]
        public IActionResult GetDatabyID(long id)
        {
            var taiXe = _taiXeBusiness.GetDatabyID(id);
            if (taiXe == null)
            {
                return NotFound(new { message = "Không tìm thấy tài xế." });
            }
            return Ok(taiXe);
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] TaiXeModel model)
        {
            var result = _taiXeBusiness.Create(model);
            return Ok(new { success = result });
        }

        [HttpPut("update")]
        public IActionResult Update([FromBody] TaiXeModel model)
        {
            var result = _taiXeBusiness.Update(model);
            return Ok(new { success = result });
        }

        [HttpDelete("delete/{id}")]
        public IActionResult Delete(long id)
        {
            var result = _taiXeBusiness.Delete(id);
            return Ok(new { success = result });
        }

        [HttpPost("search")]
        public IActionResult Search([FromBody] TaiXeSearchRequest request)
        {
            long total;
            var data = _taiXeBusiness.Search(request.PageIndex, request.PageSize, out total, request.HoTen, request.SoDienThoai);
            return Ok(new { TotalItems = total, Data = data });
        }

        [HttpGet("dashboard-stats/{idTaiXe}")]
        public IActionResult GetDashboardStats(long idTaiXe)
        {
            try
            {
                var stats = _taiXeBusiness.GetDashboardStats(idTaiXe);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}