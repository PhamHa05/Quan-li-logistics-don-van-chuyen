    using BLL.Interfaces;
    using Logistics.API.Models.Request;
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
                if (model == null || model.MaNguoiDung <= 0)
                    return BadRequest("Thiếu mã người dùng để cập nhật.");

                var result = _nguoiDungBusiness.Update(model);
                if (!result)
                    return NotFound(new { message = "Không tìm thấy người dùng để cập nhật!" });

                return Ok(new { success = true, message = "Cập nhật thành công!" });
            }



            [HttpDelete("delete/{id}")]
            public IActionResult Delete(int id)
            {
                var result = _nguoiDungBusiness.Delete(id);
                return Ok(new { success = result });
            }

            [HttpGet]
            public IActionResult GetAll([FromQuery] string? hoTen, [FromQuery] string? tenDangNhap)
            {
                var data = _nguoiDungBusiness.GetAll(hoTen, tenDangNhap);
                return Ok(data);
            }
        }
    }