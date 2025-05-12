const query = `
select * from Licenses as ls where LicenseTypeId='A6130EB5-64C8-4C41-8071-CA31ED26F389' 
and EntityId='87b51ce5-b916-45b1-7426-08dd0ec76103'  --and UserId='7ffd77e4-ae85-4960-277e-08db7270f375' 
and Id not in (
	SELECT JSON_VALUE(RequestData, '$.requestData.license.id') AS LicenseId FROM Requests 
	WHERE RequestTypeId IN (
		SELECT id FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '$.license.licenseTypeId') AS licenseTypeId 
		WHERE licenseTypeId.value = 'A6130EB5-64C8-4C41-8071-CA31ED26F389'  -- licenseTypeId
	)
	AND RequestStatusId IN ('46606116-D22E-4271-99A4-0191BE626E5F','173FEFCE-47BF-47DC-AB04-686F93AEF312','9320B864-7527-4CC2-B200-FB16FCBC44B7')  --(open,returned,new) draft
	and EntityId='87b51ce5-b916-45b1-7426-08dd0ec76103'  --AND CreatedBy='7ffd77e4-ae85-4960-277e-08db7270f375' 	
)
and RequestId in ( (SELECT fieldValidations.value FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '$.license.fieldValidations') AS fieldValidations WHERE Id = '17c13ed3-689a-49fe-9a23-0b40bdbe9dca') is null or
	(SELECT r.Id FROM Requests r 
	JOIN (SELECT r.Id AS RequestId, fv.RequestTypeId, COUNT(*) AS TotalValidations,
		SUM(CASE WHEN JSON_VALUE(r.RequestData, '$.' + fv.ValidationKey) = fv.ValidationValue THEN 1 ELSE 0 END) AS PassedValidations FROM Requests r 
		CROSS JOIN (
			SELECT rt.Id AS RequestTypeId, JSONData.[key] AS ValidationKey, JSONData.[value] AS ValidationValue FROM RequestTypes rt
			CROSS APPLY OPENJSON(rt.AvailableRequestTypes, '$.license.fieldValidations') WITH ([key] NVARCHAR(MAX), [value] NVARCHAR(MAX)) AS JSONData
			where Id = '8E2FAABF-D426-4558-9176-65F330BB95B9'
		) fv where r.RequestTypeId = '8E2FAABF-D426-4558-9176-65F330BB95B9' GROUP BY r.Id, fv.RequestTypeId) vc 
	ON r.Id = vc.RequestId WHERE vc.TotalValidations = vc.PassedValidations )
)
and LicenseStatus in ( (SELECT lsstts.value FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '$.license.licenseStatus') AS lsstts WHERE Id = '17c13ed3-689a-49fe-9a23-0b40bdbe9dca') is null or
    (SELECT lsstts.value FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '$.license.licenseStatus') AS lsstts WHERE Id = '17c13ed3-689a-49fe-9a23-0b40bdbe9dca')
)
and Id in (	 (SELECT actISIC.value FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '$.license.activityIISIC') AS actISIC WHERE Id = '17c13ed3-689a-49fe-9a23-0b40bdbe9dca') is null or 
	(SELECT LicenseId FROM LicenseISICActivities where ISICActivityId in (
		SELECT actISIC.value FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '$.license.activityIISIC') AS actISIC WHERE Id = '17c13ed3-689a-49fe-9a23-0b40bdbe9dca' 
	)
	and LicenseId=ls.Id)
)
AND ( (SELECT JSON_VALUE(AvailableRequestTypes, '$.license.expiryDaysMoreThan') AS expiryDaysMoreThan FROM RequestTypes where Id = '8E2FAABF-D426-4558-9176-65F330BB95B9') is null or (DATEDIFF(DAY, CURRENT_TIMESTAMP, l.ExpiryDate) > (SELECT JSON_VALUE(AvailableRequestTypes, '$.license.expiryDaysMoreThan') AS expiryDaysMoreThan FROM RequestTypes where Id = '8E2FAABF-D426-4558-9176-65F330BB95B9')))
AND ( (SELECT JSON_VALUE(AvailableRequestTypes, '$.license.expiryDaysLessThan') AS expiryDaysLessThan FROM RequestTypes where Id = '8E2FAABF-D426-4558-9176-65F330BB95B9') is null or (DATEDIFF(DAY, CURRENT_TIMESTAMP, l.ExpiryDate) < (SELECT JSON_VALUE(AvailableRequestTypes, '$.license.expiryDaysLessThan') AS expiryDaysLessThan FROM RequestTypes where Id = '8E2FAABF-D426-4558-9176-65F330BB95B9')))
`;

export const basicQueryStarter = {
  queryType: "SELECT",
  select: ["*"],
  from: {
    table: "Licenses",
    alias: "l",
  },
  joins: [],
  where: [],
};

export const joinQueryStarter = {
  queryType: "SELECT",
  select: ["*"],
  from: {
    table: "Licenses",
    alias: "l",
  },
  joins: [],
  where: [],
  on: "",
  type: "INNER",
};
// Explanation of JSON Concepts
// type keys allow the query builder to interpret how to render conditions (e.g. condition, in_subquery, not_in_subquery, optional_condition).
// configPath allows the builder to check if a config key exists and build conditionally.
// openjson entries describe parsing JSON arrays from columns.
// customSql is for advanced expressions not easily structured (as fallback).

const params = {
  queryType: "SELECT",
  select: ["*"],
  from: {
    table: "Licenses",
    alias: "l",
  },
  joins: [],
  where: [
    {
      type: "condition",
      column: "l.LicenseTypeId",
      operator: "=",
      value: "A6130EB5-64C8-4C41-8071-CA31ED26F389",
    },
    {
      type: "condition",
      column: "l.EntityId",
      operator: "=",
      value: "87b51ce5-b916-45b1-7426-08dd0ec76103",
    },
    {
      type: "not_in_subquery",
      column: "l.Id",
      subquery: {
        select: [
          {
            json_value: {
              column: "RequestData",
              path: "$.requestData.license.id",
            },
            alias: "LicenseId",
          },
        ],
        from: {
          table: "Requests",
          alias: "r",
        },
        where: [
          {
            type: "in_subquery",
            column: "r.RequestTypeId",
            subquery: {
              select: ["rt.Id"],
              from: {
                table: "RequestTypes",
                alias: "rt",
              },
              openjson: {
                column: "AvailableRequestTypes",
                path: "$.license.licenseTypeId",
              },
              where: [
                {
                  type: "condition",
                  column: "licenseTypeId.value",
                  operator: "=",
                  value: "A6130EB5-64C8-4C41-8071-CA31ED26F389",
                },
              ],
            },
          },
          {
            type: "in",
            column: "r.RequestStatusId",
            values: [
              "46606116-D22E-4271-99A4-0191BE626E5F",
              "173FEFCE-47BF-47DC-AB04-686F93AEF312",
              "9320B864-7527-4CC2-B200-FB16FCBC44B7",
            ],
          },
          {
            type: "condition",
            column: "r.EntityId",
            operator: "=",
            value: "87b51ce5-b916-45b1-7426-08dd0ec76103",
          },
        ],
      },
    },
    {
      type: "optional_condition_or_subquery",
      configPath: "$.license.fieldValidations",
      requestTypeId: "17c13ed3-689a-49fe-9a23-0b40bdbe9dca",
      subquery: {
        description:
          "Join validations and requests, check if passed validations == total validations",
        customSql:
          "(SELECT r.Id FROM Requests r JOIN (...) vc ON r.Id = vc.RequestId WHERE vc.TotalValidations = vc.PassedValidations)",
      },
    },
    {
      type: "optional_condition_or_subquery",
      configPath: "$.license.licenseStatus",
      requestTypeId: "17c13ed3-689a-49fe-9a23-0b40bdbe9dca",
      column: "l.LicenseStatus",
      subquery: {
        select: ["lsstts.value"],
        from: {
          table: "RequestTypes",
          alias: "rt",
        },
        openjson: {
          column: "AvailableRequestTypes",
          path: "$.license.licenseStatus",
        },
        where: [
          {
            type: "condition",
            column: "rt.Id",
            operator: "=",
            value: "17c13ed3-689a-49fe-9a23-0b40bdbe9dca",
          },
        ],
      },
    },
    {
      type: "optional_condition_or_subquery",
      configPath: "$.license.activityIISIC",
      requestTypeId: "17c13ed3-689a-49fe-9a23-0b40bdbe9dca",
      column: "l.Id",
      subquery: {
        select: ["LicenseId"],
        from: {
          table: "LicenseISICActivities",
        },
        where: [
          {
            type: "in_subquery",
            column: "ISICActivityId",
            subquery: {
              select: ["actISIC.value"],
              from: {
                table: "RequestTypes",
              },
              openjson: {
                column: "AvailableRequestTypes",
                path: "$.license.activityIISIC",
              },
              where: [
                {
                  type: "condition",
                  column: "Id",
                  operator: "=",
                  value: "17c13ed3-689a-49fe-9a23-0b40bdbe9dca",
                },
              ],
            },
          },
        ],
      },
    },
    {
      type: "optional_date_range_condition",
      column: "l.ExpiryDate",
      configPaths: {
        min: "$.license.expiryDaysMoreThan",
        max: "$.license.expiryDaysLessThan",
      },
      requestTypeId: "8E2FAABF-D426-4558-9176-65F330BB95B9",
    },
  ],
};

export const params1 = {
  queryType: "SELECT",
  select: ["*"],
  from: {
    table: "Licenses",
    alias: "l",
  },
  joins: [],
  where: [
    {
      type: "condition",
      column: "l.LicenseTypeId",
      operator: "=",
      value: "A6130EB5-64C8-4C41-8071-CA31ED26F389",
    },
    {
      type: "condition",
      column: "l.EntityId",
      operator: "=",
      value: "87b51ce5-b916-45b1-7426-08dd0ec76103",
    },
    {
      type: "not_in_subquery",
      column: "l.Id",
      subquery: {
        select: [
          {
            json_value: {
              column: "RequestData",
              path: "$.requestData.license.id",
            },
            alias: "LicenseId",
          },
        ],
        from: {
          table: "Requests",
          alias: "r",
        },
        where: [
          {
            type: "in_subquery",
            column: "r.RequestTypeId",
            subquery: {
              select: ["rt.Id"],
              from: {
                table: "RequestTypes",
                alias: "rt",
              },
              openjson: {
                column: "AvailableRequestTypes",
                path: "$.license.licenseTypeId",
              },
              where: [
                {
                  type: "condition",
                  column: "licenseTypeId.value",
                  operator: "=",
                  value: "A6130EB5-64C8-4C41-8071-CA31ED26F389",
                },
              ],
            },
          },
          {
            type: "in",
            column: "r.RequestStatusId",
            values: [
              "46606116-D22E-4271-99A4-0191BE626E5F",
              "173FEFCE-47BF-47DC-AB04-686F93AEF312",
              "9320B864-7527-4CC2-B200-FB16FCBC44B7",
            ],
          },
          {
            type: "condition",
            column: "r.EntityId",
            operator: "=",
            value: "87b51ce5-b916-45b1-7426-08dd0ec76103",
          },
        ],
      },
    },
    {
      type: "custom_validation_match",
      requestTypeId: "8E2FAABF-D426-4558-9176-65F330BB95B9",
      targetRequestTypeId: "8E2FAABF-D426-4558-9176-65F330BB95B9",
      validationsFrom: {
        table: "RequestTypes",
        column: "AvailableRequestTypes",
        jsonPath: "$.license.fieldValidations",
      },
      validationLogic: {
        source: "Requests",
        compareColumn: "RequestData",
        matchExpression:
          "JSON_VALUE(r.RequestData, '$.' + ValidationKey) = ValidationValue",
        groupBy: "r.Id",
        filters: [
          {
            column: "r.RequestTypeId",
            operator: "=",
            value: "8E2FAABF-D426-4558-9176-65F330BB95B9",
          },
        ],
      },
      finalJoin: {
        table: "Requests",
        alias: "r",
        on: "r.Id = vc.RequestId",
        condition: "vc.TotalValidations = vc.PassedValidations",
      },
    },
    {
      type: "optional_condition_or_subquery",
      configPath: "$.license.licenseStatus",
      requestTypeId: "17c13ed3-689a-49fe-9a23-0b40bdbe9dca",
      column: "l.LicenseStatus",
      subquery: {
        select: ["lsstts.value"],
        from: {
          table: "RequestTypes",
          alias: "rt",
        },
        openjson: {
          column: "AvailableRequestTypes",
          path: "$.license.licenseStatus",
        },
        where: [
          {
            type: "condition",
            column: "rt.Id",
            operator: "=",
            value: "17c13ed3-689a-49fe-9a23-0b40bdbe9dca",
          },
        ],
      },
    },
    {
      type: "optional_condition_or_subquery",
      configPath: "$.license.activityIISIC",
      requestTypeId: "17c13ed3-689a-49fe-9a23-0b40bdbe9dca",
      column: "l.Id",
      subquery: {
        select: ["LicenseId"],
        from: {
          table: "LicenseISICActivities",
        },
        where: [
          {
            type: "in_subquery",
            column: "ISICActivityId",
            subquery: {
              select: ["actISIC.value"],
              from: {
                table: "RequestTypes",
              },
              openjson: {
                column: "AvailableRequestTypes",
                path: "$.license.activityIISIC",
              },
              where: [
                {
                  type: "condition",
                  column: "Id",
                  operator: "=",
                  value: "17c13ed3-689a-49fe-9a23-0b40bdbe9dca",
                },
              ],
            },
          },
        ],
      },
    },
    {
      type: "optional_date_range_condition",
      column: "l.ExpiryDate",
      configPaths: {
        min: "$.license.expiryDaysMoreThan",
        max: "$.license.expiryDaysLessThan",
      },
      requestTypeId: "8E2FAABF-D426-4558-9176-65F330BB95B9",
    },
  ],
};

export function generateSQL(queryJson) {
  console.log("queryJson: ", queryJson);
  let sqlQuery = "";

  // Handle SELECT
  sqlQuery += `SELECT ${queryJson.select.join(", ")}\n`;

  // Handle FROM clause
  sqlQuery += `FROM ${queryJson.from.table} ${queryJson.from.alias}\n`;

  // Handle JOINS (none in the given structure, but we will include if necessary)
  if (queryJson.joins && queryJson.joins.length > 0) {
    queryJson.joins.forEach((join) => {
      sqlQuery += `JOIN ${join.table} ${join.alias} ON ${join.on}\n`;
    });
  }

  // Handle WHERE conditions
  if (queryJson.where && queryJson.where.length > 0) {
    sqlQuery += "WHERE ";
    queryJson.where.forEach((condition, index) => {
      if (index > 0) sqlQuery += " AND ";
      switch (condition.type) {
        case "condition":
          sqlQuery += `${condition.column} ${condition.operator} '${condition.value}'`;
          break;
        case "not_in_subquery":
          sqlQuery += `${condition.column} NOT IN ( ${generateSQL(
            condition.subquery
          )} )`;
          break;
        case "in_subquery":
          sqlQuery += `${condition.column} IN ( ${generateSQL(
            condition.subquery
          )} )`;
          break;
        case "custom_validation_match":
          sqlQuery += `EXISTS (SELECT 1 FROM ${condition.validationsFrom.table} vc WHERE ${condition.validationLogic.matchExpression} AND ${condition.finalJoin.condition})`;
          break;
        case "optional_condition_or_subquery":
          sqlQuery += `${condition.column} = (SELECT ${generateSQL(
            condition.subquery
          )})`;
          break;
        case "optional_date_range_condition":
          sqlQuery += `${condition.column} BETWEEN '${condition.configPaths.min}' AND '${condition.configPaths.max}'`;
          break;
      }
    });
  }

  return sqlQuery.trim();
}

// export function generateSQL1(query) {
//   const selectClause = `SELECT ${query.select.join(", ")} FROM ${
//     query.from.table
//   } AS ${query.from.alias}`;
//   const whereClause = buildWhereClause(query.where);
//   return `${selectClause} WHERE ${whereClause}`;
// }

// function buildWhereClause(conditions) {
//   return conditions
//     .map((condition) => {
//       switch (condition.type) {
//         case "condition":
//           return `${condition.column} ${condition.operator} '${condition.value}'`;
//         case "not_in_subquery":
//           return `${condition.column} NOT IN (${buildSubquery(
//             condition.subquery
//           )})`;
//         // Implement other condition types as needed
//         default:
//           return "";
//       }
//     })
//     .join(" AND ");
// }

// function buildSubquery(subquery) {
//   const selectClause = `SELECT ${subquery.select
//     .map((sel) => {
//       if (sel.json_value) {
//         return `JSON_VALUE(${sel.json_value.column}, '${sel.json_value.path}') AS ${sel.alias}`;
//       }
//       return sel;
//     })
//     .join(", ")}`;
//   const fromClause = `FROM ${subquery.from.table} AS ${subquery.from.alias}`;
//   const whereClause = buildWhereClause(subquery.where);
//   return `${selectClause} ${fromClause} WHERE ${whereClause}`;
// }

//
//
//

export function generateSQL1(query) {
  const selectClause = `SELECT ${query.select.join(", ")} FROM ${
    query.from.table
  } AS ${query.from.alias}`;
  const whereClause = buildWhereClause(query.where);
  return `${selectClause} WHERE ${whereClause}`;
}

function buildWhereClause(conditions) {
  return conditions
    .map((condition) => {
      switch (condition.type) {
        case "condition":
          return `${condition.column} ${condition.operator} '${condition.value}'`;
        case "not_in_subquery":
          return `${condition.column} NOT IN (${buildSubquery(
            condition.subquery
          )})`;
        case "in_subquery":
          return `${condition.column} IN (${buildSubquery(
            condition.subquery
          )})`;
        case "in":
          return `${condition.column} IN (${condition.values
            .map((v) => `'${v}'`)
            .join(", ")})`;
        case "custom_validation_match":
          return buildCustomValidationMatch(condition);
        case "optional_condition_or_subquery":
          return buildOptionalConditionOrSubquery(condition);
        case "optional_date_range_condition":
          return buildOptionalDateRangeCondition(condition);
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join(" AND ");
}

function buildSubquery(subquery) {
  const select = subquery.select
    .map((sel) => {
      if (typeof sel === "string") return sel;
      if (sel.json_value) {
        return `JSON_VALUE(${sel.json_value.column}, '${sel.json_value.path}') AS ${sel.alias}`;
      }
      return "";
    })
    .join(", ");

  const from = `FROM ${subquery.from.table}${
    subquery.from.alias ? " AS " + subquery.from.alias : ""
  }`;
  const openjson = subquery.openjson
    ? `CROSS APPLY OPENJSON(${subquery.openjson.column}, '${
        subquery.openjson.path
      }') AS ${subquery.openjson.path.split(".").pop()}`
    : "";
  const where = subquery.where
    ? "WHERE " + buildWhereClause(subquery.where)
    : "";

  return `SELECT ${select} ${from} ${openjson} ${where}`;
}

function buildCustomValidationMatch(cond) {
  const jsonExtract = `SELECT ${cond.validationsFrom.jsonPath
    .split(".")
    .pop()}.value FROM ${cond.validationsFrom.table} CROSS APPLY OPENJSON(${
    cond.validationsFrom.column
  }, '${cond.validationsFrom.jsonPath}') AS ${cond.validationsFrom.jsonPath
    .split(".")
    .pop()} WHERE Id = '${cond.requestTypeId}'`;

  const validationLogic = `SELECT r.Id FROM Requests r \
  JOIN (SELECT r.Id AS RequestId, fv.RequestTypeId, COUNT(*) AS TotalValidations, \
  SUM(CASE WHEN JSON_VALUE(r.${cond.validationLogic.compareColumn}, '$.' + ValidationKey) = ValidationValue THEN 1 ELSE 0 END) AS PassedValidations \
  FROM Requests r CROSS JOIN ( \
  SELECT rt.Id AS RequestTypeId, JSONData.[key] AS ValidationKey, JSONData.[value] AS ValidationValue \
  FROM RequestTypes rt CROSS APPLY OPENJSON(rt.AvailableRequestTypes, '${cond.validationsFrom.jsonPath}') \
  WITH ([key] NVARCHAR(MAX), [value] NVARCHAR(MAX)) AS JSONData \
  WHERE Id = '${cond.requestTypeId}' ) fv \
  WHERE r.RequestTypeId = '${cond.validationLogic.filters[0].value}' GROUP BY r.Id, fv.RequestTypeId) vc \
  ON r.Id = vc.RequestId WHERE vc.TotalValidations = vc.PassedValidations`;

  return `((${jsonExtract}) IS NULL OR (${validationLogic}))`;
}

function buildOptionalConditionOrSubquery(cond) {
  const pathAlias = cond.configPath.split(".").pop();
  const jsonExtract = `SELECT ${pathAlias}.value FROM RequestTypes CROSS APPLY OPENJSON(AvailableRequestTypes, '${cond.configPath}') AS ${pathAlias} WHERE Id = '${cond.requestTypeId}'`;
  const subquery = buildSubquery(cond.subquery);
  return `((${jsonExtract}) IS NULL OR (${subquery}))`;
}

function buildOptionalDateRangeCondition(cond) {
  const min = cond.configPaths.min.split(".").pop();
  const max = cond.configPaths.max.split(".").pop();
  const baseQuery = `SELECT JSON_VALUE(AvailableRequestTypes, '$.license.' + key) AS value FROM RequestTypes WHERE Id = '${cond.requestTypeId}'`;

  const minCheck = `((SELECT JSON_VALUE(AvailableRequestTypes, '${cond.configPaths.min}') FROM RequestTypes WHERE Id = '${cond.requestTypeId}') IS NULL OR DATEDIFF(DAY, CURRENT_TIMESTAMP, ${cond.column}) > (SELECT JSON_VALUE(AvailableRequestTypes, '${cond.configPaths.min}') FROM RequestTypes WHERE Id = '${cond.requestTypeId}'))`;

  const maxCheck = `((SELECT JSON_VALUE(AvailableRequestTypes, '${cond.configPaths.max}') FROM RequestTypes WHERE Id = '${cond.requestTypeId}') IS NULL OR DATEDIFF(DAY, CURRENT_TIMESTAMP, ${cond.column}) < (SELECT JSON_VALUE(AvailableRequestTypes, '${cond.configPaths.max}') FROM RequestTypes WHERE Id = '${cond.requestTypeId}'))`;

  return `${minCheck} AND ${maxCheck}`;
}

//
//
//

export const params2 = {
  queryType: "SELECT",
  select: ["*", "id", "date"],
  from: {
    table: "Licenses",
    alias: "l",
  },
  joins: [
    {
      queryType: "SELECT",
      select: ["*", "rId", "rDate"],
      from: {
        table: "Requests",
        alias: "r",
      },
      joins: [],
      where: [
        {
          type: "condition",
          error: null,
          column: "r.Id",
          operator: "=",
          value: "l.requestId",
        },
      ],
      on: "",
      type: "INNER",
    },
  ],
  where: [
    {
      type: "condition",
      error: null,
      column: "l.statusId",
      operator: "=",
      value: "2",
    },
  ],
};

const test = {
  queryType: "SELECT",
  select: ["*"],
  from: {
    table: "Licenses",
    alias: "l",
  },
  joins: [],
  where: [],
};

export function generateSQL2(json) {
  console.log("json: ", json);
  function escapeValue(value) {
    return typeof value === "string" && !value.includes(".")
      ? `'${value}'`
      : value;
  }

  function processSelect(select) {
    console.log("select: ", select);
    return select?.join(", ");
  }

  function processFrom(from) {
    return `${from?.table} AS ${from?.alias}`;
  }

  function processWhere(whereArray) {
    if (!whereArray || !whereArray.length) return "";
    const conditions = whereArray
      .map((cond) => {
        if (cond.type === "condition") {
          return `${cond.column} ${cond.operator} ${escapeValue(cond.value)}`;
        }
        return "";
      })
      .filter(Boolean);
    return conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  }

  function processJoin(join) {
    const joinSelect = processSelect(join?.select);
    const joinFrom = processFrom(join?.from);
    const joinWhere = processWhere(join?.where);

    // If join.on is provided explicitly, use it, otherwise derive from where (for nested joins)
    const onCondition =
      join.on ||
      join.where
        ?.map((w) => `${w.column} ${w.operator} ${w.value}`)
        .join(" AND ");

    return `${join.type} JOIN (
        SELECT ${joinSelect}
        FROM ${joinFrom}
        ${joinWhere}
      ) AS ${join.from.alias} ON ${onCondition}`;
  }

  const select = processSelect(json.select);
  const from = processFrom(json.from);
  const joins = (json.joins || []).map(processJoin).join("\n");
  const where = processWhere(json.where);

  const sql = `SELECT ${select}
  FROM ${from}
  ${joins}
  ${where ? "\n" + where : ""}`;

  return sql;
}
