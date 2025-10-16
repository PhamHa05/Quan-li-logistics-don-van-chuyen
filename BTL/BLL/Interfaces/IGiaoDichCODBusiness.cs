using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;

    


namespace BLL.Interfaces
{
    public interface IGiaoDichCODBusiness
    {
        bool Create(GiaoDichCODModel model);
        bool Update(GiaoDichCODModel model);
        GiaoDichCODModel GetByDonVanChuyenID(long donVanChuyenId);
    }
}
