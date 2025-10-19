using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Helper.Interfaces
{
    /// <summary>
    /// Helper để thực thi các lệnh SQL thuần (ADO.NET) trong toàn bộ DAL.
    /// </summary>
    public interface IDatabaseHelper
    {
        DataTable ExecuteQuery(string sql, SqlParameter[] parameters = null);
        int ExecuteNonQuery(string sql, SqlParameter[] parameters = null);
        object ExecuteScalar(string sql, SqlParameter[] parameters = null);

    }
}