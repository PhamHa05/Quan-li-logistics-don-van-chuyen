using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;

namespace DAL.Helper
{
    public static class DataTableExtensions
    {
        public static List<T> ConvertTo<T>(this DataTable dt) where T : new()
        {
            if (dt == null) return new List<T>();

            List<T> list = new List<T>();
            var properties = typeof(T).GetProperties();

            foreach (DataRow row in dt.Rows)
            {
                T item = new T();
                foreach (var prop in properties)
                {
                    if (dt.Columns.Contains(prop.Name) && row[prop.Name] != DBNull.Value)
                    {
                        Type targetType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
                        object safeValue = Convert.ChangeType(row[prop.Name], targetType);
                        prop.SetValue(item, safeValue);
                    }
                }
                list.Add(item);
            }

            return list;
        }
    }
}
