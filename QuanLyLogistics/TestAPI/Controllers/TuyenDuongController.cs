using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;
using TestAPI.SearchRequest;

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

        [HttpDelete("delete/{id}")]
        public IActionResult Delete(long id)
        {
            var result = _tuyenDuongBusiness.Delete(id);
            return Ok(new { success = result });
        }

        [HttpPost("search")]
        public IActionResult Search([FromBody] TuyenDuongSearchRequest request)
        {
            long total;
            var data = _tuyenDuongBusiness.Search(request.PageIndex, request.PageSize, out total, request.MaTuyen, request.IdTaiXe);
            return Ok(new { TotalItems = total, Data = data });
        }
    }
}