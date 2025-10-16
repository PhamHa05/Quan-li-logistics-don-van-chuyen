using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Helper.Interfaces
{
    public interface IDatabaseHelper
    {
        // Thực thi Stored Procedure trả về một giá trị đơn (scalar) và có dùng transaction
        object ExecuteScalarSProcedureWithTransaction(out string msgError, string spName, params object[] parameters);

        // Thực thi Stored Procedure trả về một DataTable
        DataTable ExecuteSProcedureReturnDataTable(out string msgError, string spName, params object[] parameters);
    }
}
