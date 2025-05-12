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

const params1 = {
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
