using BLL.Interfaces;
using Logistics.API.Models.Request; // Nhớ using model vừa tạo
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Logistics.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {
        private readonly INguoiDungBusiness _nguoiDungBusiness;

        public NguoiDungController(INguoiDungBusiness nguoiDungBusiness)
        {
            _nguoiDungBusiness = nguoiDungBusiness;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequestModel model)
        {
            var user = _nguoiDungBusiness.Login(model.TenDangNhap, model.MatKhau);
            if (user == null)
            {
                return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không chính xác!" });
            }
            // Trong thực tế, bạn sẽ tạo và trả về một JWT Token ở đây
            return Ok(user);
        }

        [HttpGet("get-by-id/{id}")]
        public IActionResult GetDatabyID(int id)
        {
            var user = _nguoiDungBusiness.GetDatabyID(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] NguoiDungModel model)
        {
            var result = _nguoiDungBusiness.Create(model);
            return Ok(new { success = result });
        }

        [HttpPut("update")]
        public IActionResult Update([FromBody] NguoiDungModel model)
        {
            var result = _nguoiDungBusiness.Update(model);
            return Ok(new { success = result });
        }

        [HttpDelete("delete/{id}")]
        public IActionResult Delete(int id)
        {
            var result = _nguoiDungBusiness.Delete(id);
            return Ok(new { success = result });
        }

        // Tạo một model riêng cho việc tìm kiếm để API rõ ràng hơn
        // Bạn có thể tạo file SearchRequest.cs
        public class SearchRequest
        {
            public int PageIndex { get; set; }
            public int PageSize { get; set; }
            public string HoTen { get; set; }
            public string TenDangNhap { get; set; }
        }

        [HttpPost("search")]
        public IActionResult Search([FromBody] SearchRequest request)
        {
            long total;
            var data = _nguoiDungBusiness.Search(request.PageIndex, request.PageSize, out total, request.HoTen, request.TenDangNhap);
            return Ok(new { TotalItems = total, Data = data });
        }
    }
}