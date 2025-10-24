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
    }
}
