using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IGiaoDichCODRepository
    {
        bool Create(GiaoDichCODModel model);
        bool Update(GiaoDichCODModel model);
        GiaoDichCODModel GetByDonVanChuyenId(long donVanChuyenId);
    }
}
