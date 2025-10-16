using DAL.Helper.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Helper
{
    public class DatabaseHelper : IDatabaseHelper
    {
        private readonly string _connectionString;

        // "Tiêm" IConfiguration vào để lấy chuỗi kết nối từ file appsettings.json
        public DatabaseHelper(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        // Triển khai phương thức từ interface
        public DataTable ExecuteSProcedureReturnDataTable(out string msgError, string spName, params object[] parameters)
        {
            msgError = "";
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand(spName, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        AddParameters(command, parameters);
                        using (SqlDataAdapter adapter = new SqlDataAdapter(command))
                        {
                            adapter.Fill(dt);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
            }
            return dt;
        }

        // Triển khai phương thức từ interface
        public object ExecuteScalarSProcedureWithTransaction(out string msgError, string spName, params object[] parameters)
        {
            msgError = "";
            object result = null;
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand(spName, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        AddParameters(command, parameters);
                        result = command.ExecuteScalar();
                    }
                }
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
            }
            return result;
        }

        // Hàm hỗ trợ để thêm tham số vào SqlCommand
        private void AddParameters(SqlCommand command, object[] parameters)
        {
            if (parameters != null)
            {
                for (int i = 0; i < parameters.Length; i += 2)
                {
                    string name = parameters[i].ToString();
                    object value = parameters[i + 1] ?? DBNull.Value;
                    command.Parameters.AddWithValue(name, value);
                }
            }
        }
    }
}
