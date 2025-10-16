using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Helper
{
    public static class DataTableExtensions
    {
        public static List<T> ConvertTo<T>(this DataTable dt) where T : new()
        {
            if (dt == null)
            {
                return new List<T>();
            }

            List<T> list = new List<T>();
            List<PropertyInfo> properties = new List<PropertyInfo>(typeof(T).GetProperties());

            foreach (DataRow row in dt.Rows)
            {
                T item = new T();
                foreach (PropertyInfo prop in properties)
                {
                    // Kiểm tra xem cột có tồn tại trong DataTable không và giá trị không phải là DBNull
                    if (dt.Columns.Contains(prop.Name) && row[prop.Name] != DBNull.Value)
                    {
                        // Chuyển đổi kiểu dữ liệu và gán giá trị cho thuộc tính
                        prop.SetValue(item, Convert.ChangeType(row[prop.Name], prop.PropertyType), null);
                    }
                }
                list.Add(item);
            }

            return list;
        }
    }
}
