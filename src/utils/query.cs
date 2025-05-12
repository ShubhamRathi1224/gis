using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


// General-purpose SQL Query Builder with support for various dynamic conditions
using System.Text;
using System.Text.Json.Nodes;
using System.Collections.Generic;

public class QueryBuilder
{
    private readonly StringBuilder _queryBuilder = new();

    public string BuildQuery(JsonArray filters)
    {
        foreach (var conditionNode in filters)
        {
            if (conditionNode is not JsonObject condition) continue;

            var type = condition["type"]?.ToString();
            switch (type)
            {
                case "custom_validation_match":
                    _queryBuilder.AppendLine(BuildCustomValidationMatch(condition));
                    break;
                case "expiry_days_less_than":
                    _queryBuilder.AppendLine(BuildExpiryDaysLessThan(condition));
                    break;
                case "license_status_check":
                    _queryBuilder.AppendLine(BuildLicenseStatus(condition));
                    break;
                // Add more cases for other types like ISIC, expiryDaysMoreThan, etc.
            }
        }

        return _queryBuilder.ToString();
    }

    private string BuildCustomValidationMatch(JsonObject condition)
    {
        var requestTypeId = condition["requestTypeId"]?.ToString();
        var targetRequestTypeId = condition["targetRequestTypeId"]?.ToString();

        var jsonPath = condition["validationsFrom"]?["jsonPath"]?.ToString();
        var validationsTable = condition["validationsFrom"]?["table"]?.ToString();

        var alias = condition["finalJoin"]?["alias"]?.ToString() ?? "r";
        var matchExpression = condition["validationLogic"]?["matchExpression"]?.ToString();

        var builder = new StringBuilder();
        builder.AppendLine("EXISTS (");
        builder.AppendLine($"  SELECT {alias}.Id FROM Requests {alias}");
        builder.AppendLine("  JOIN (");
        builder.AppendLine("    SELECT r.Id AS RequestId, fv.RequestTypeId,");
        builder.AppendLine("           COUNT(*) AS TotalValidations,");
        builder.AppendLine("           SUM(CASE WHEN " + matchExpression + " THEN 1 ELSE 0 END) AS PassedValidations");
        builder.AppendLine("    FROM Requests r");
        builder.AppendLine("    CROSS JOIN (");
        builder.AppendLine($"      SELECT rt.Id AS RequestTypeId,");
        builder.AppendLine("             JSONData.[key] AS ValidationKey,");
        builder.AppendLine("             JSONData.[value] AS ValidationValue");
        builder.AppendLine($"      FROM {validationsTable} rt");
        builder.AppendLine($"      CROSS APPLY OPENJSON(rt.AvailableRequestTypes, '{jsonPath}')");
        builder.AppendLine("        WITH ([key] NVARCHAR(MAX), [value] NVARCHAR(MAX)) AS JSONData");
        builder.AppendLine($"      WHERE rt.Id = '{targetRequestTypeId}'");
        builder.AppendLine("    ) fv");
        builder.AppendLine($"    WHERE r.RequestTypeId = '{requestTypeId}'");
        builder.AppendLine("    GROUP BY r.Id, fv.RequestTypeId");
        builder.AppendLine("  ) vc ON r.Id = vc.RequestId");
        builder.AppendLine("  WHERE vc.TotalValidations = vc.PassedValidations");
        builder.AppendLine(")");

        return builder.ToString();
    }

    private string BuildExpiryDaysLessThan(JsonObject condition)
    {
        var requestTypeId = condition["requestTypeId"]?.ToString();
        var jsonPath = condition["jsonPath"]?.ToString();
        var column = condition["column"]?.ToString() ?? "ExpiryDate";
        var tableAlias = condition["tableAlias"]?.ToString() ?? "l";

        return $"(SELECT JSON_VALUE(AvailableRequestTypes, '{jsonPath}') FROM RequestTypes WHERE Id = '{requestTypeId}') IS NULL OR " +
               $"(DATEDIFF(DAY, CURRENT_TIMESTAMP, {tableAlias}.{column}) < " +
               $"(SELECT JSON_VALUE(AvailableRequestTypes, '{jsonPath}') FROM RequestTypes WHERE Id = '{requestTypeId}'))";
    }

    private string BuildLicenseStatus(JsonObject condition)
    {
        var requestTypeId = condition["requestTypeId"]?.ToString();
        var jsonPath = condition["jsonPath"]?.ToString();
        var column = condition["column"]?.ToString() ?? "LicenseStatus";

        return $"(SELECT lsstts.value FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '{jsonPath}') AS lsstts WHERE Id = '{requestTypeId}') IS NULL OR " +
               $"{column} IN (SELECT lsstts.value FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '{jsonPath}') AS lsstts WHERE Id = '{requestTypeId}')";
    }




// new
    private string BuildCustomValidationMatch1(JsonObject obj)
    {
        var requestTypeId = obj["requestTypeId"]?.ToString();
        var targetRequestTypeId = obj["targetRequestTypeId"]?.ToString();

        var validationsFrom = obj["validationsFrom"]?.AsObject();
        var vfTable = validationsFrom["table"]?.ToString();
        var vfColumn = validationsFrom["column"]?.ToString();
        var vfJsonPath = validationsFrom["jsonPath"]?.ToString();

        var logic = obj["validationLogic"]?.AsObject();
        var sourceTable = logic["source"]?.ToString();
        var compareColumn = logic["compareColumn"]?.ToString();
        var matchExpression = logic["matchExpression"]?.ToString();
        var groupBy = logic["groupBy"]?.ToString();

        var filters = logic["filters"]?.AsArray();
        var filterConditions = new List<string>();
        foreach (var filter in filters)
        {
            var f = filter.AsObject();
            filterConditions.Add($"{f["column"]} {f["operator"]} '{f["value"]}'");
        }
        var filterSql = string.Join(" AND ", filterConditions);

        var finalJoin = obj["finalJoin"]?.AsObject();
        var finalTable = finalJoin["table"]?.ToString();
        var finalAlias = finalJoin["alias"]?.ToString();
        var finalOn = finalJoin["on"]?.ToString();
        var finalCondition = finalJoin["condition"]?.ToString();

        return $@"
    EXISTS (
    SELECT {finalAlias}.Id
    FROM {finalTable} {finalAlias}
    JOIN (
        SELECT r.Id AS RequestId, fv.RequestTypeId, COUNT(*) AS TotalValidations,
            SUM(CASE WHEN {matchExpression} THEN 1 ELSE 0 END) AS PassedValidations
        FROM {sourceTable} r
        CROSS JOIN (
        SELECT rt.Id AS RequestTypeId, JSONData.[key] AS ValidationKey, JSONData.[value] AS ValidationValue
        FROM {vfTable} rt
        CROSS APPLY OPENJSON(rt.{vfColumn}, '{vfJsonPath}')
        WITH ([key] NVARCHAR(MAX), [value] NVARCHAR(MAX)) AS JSONData
        WHERE rt.Id = '{requestTypeId}'
        ) fv
        WHERE {filterSql}
        GROUP BY {groupBy}, fv.RequestTypeId
    ) vc ON {finalOn}
    WHERE {finalCondition}
    )".Trim();
    }

    private string BuildWhereClause(JsonArray whereConditions)
    {
        var clauses = new List<string>();

        foreach (var condition in whereConditions)
        {
            var obj = condition.AsObject();
            var type = obj["type"]?.ToString();

            switch (type)
            {
                case "condition":
                    clauses.Add(BuildBasicCondition(obj));
                    break;
                case "in_subquery":
                    clauses.Add(BuildInSubquery(obj));
                    break;
                case "not_in_subquery":
                    clauses.Add(BuildNotInSubquery(obj));
                    break;
                case "custom_validation_match":
                    clauses.Add(BuildCustomValidationMatch1(obj));
                    break;
                // Extend support for additional custom types here
                case "custom_license_status_filter":
                    clauses.Add(BuildCustomLicenseStatusFilter(obj));
                    break;
                default:
                    throw new Exception($"Unsupported where clause type: {type}");
            }
        }

        return string.Join(" AND ", clauses);
    }

    private string BuildCustomLicenseStatusFilter(JsonObject obj)
    {
        var requestTypeId = obj["requestTypeId"]?.ToString();
        var jsonPath = obj["jsonPath"]?.ToString();
        var licenseColumn = obj["licenseColumn"]?.ToString();

        return $@"
    (
    (SELECT lsstts.value FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '{jsonPath}') AS lsstts WHERE Id = '{requestTypeId}') IS NULL
    OR
    {licenseColumn} IN (
        SELECT lsstts.value FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '{jsonPath}') AS lsstts WHERE Id = '{requestTypeId}'
    )
    )".Trim();
    }



}
