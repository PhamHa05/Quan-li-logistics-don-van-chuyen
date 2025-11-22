using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;
using Logistics.API.Models.Request;

namespace Logistics.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DonVanChuyenController : ControllerBase
    {
        private readonly IDonVanChuyenBusiness _donVanChuyenBusiness;

        public DonVanChuyenController(IDonVanChuyenBusiness donVanChuyenBusiness)
        {
            _donVanChuyenBusiness = donVanChuyenBusiness ?? throw new ArgumentNullException(nameof(donVanChuyenBusiness));
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var donHangs = _donVanChuyenBusiness.GetAll();
            return Ok(donHangs);
        }

        [HttpGet("by-tai-xe/{idTaiXe}")]
        public IActionResult GetByIdTaiXe(long idTaiXe)
        {
            var donHangs = _donVanChuyenBusiness.GetByIdTaiXe(idTaiXe);
            return Ok(donHangs);
        }

        [HttpGet("get-by-id/{id}")]
        public IActionResult GetDatabyID(long id)
        {
            var donHang = _donVanChuyenBusiness.GetDatabyID(id);
            if (donHang == null)
            {
                return NotFound();
            }
            return Ok(donHang);
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] DonVanChuyenModel model)
        {
            try
            {
                var result = _donVanChuyenBusiness.Create(model);
                return Ok(new { success = result, message = "Tạo đơn hàng thành công" });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("update")]
        public IActionResult Update([FromBody] DonVanChuyenModel model)
        {
            var result = _donVanChuyenBusiness.Update(model);
            return Ok(new { success = result });
        }

        [HttpDelete("delete/{id}")]
        public IActionResult Delete(long id)
        {
            var result = _donVanChuyenBusiness.Delete(id);
            return Ok(new { success = result });
        }

        [HttpPost("search")]
        public IActionResult Search([FromBody] DonVanChuyenSearchRequest request)
        {
            long total;
            var data = _donVanChuyenBusiness.Search(request.PageIndex, request.PageSize, out total, request.MaVanDon, request.TrangThai);
            return Ok(new { TotalItems = total, Data = data });
        }
    }
}