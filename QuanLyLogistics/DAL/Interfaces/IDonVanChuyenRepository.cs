using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IDonVanChuyenRepository
    {
        bool Create(DonVanChuyenModel model);
        bool Update(DonVanChuyenModel model);
        bool Delete(long id);
        DonVanChuyenModel GetDatabyID(long id);
        List<DonVanChuyenModel> Search(int pageIndex, int pageSize, out long total, string ma_van_don, string trang_thai);
    }
}
