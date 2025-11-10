import type {
	IDataObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { objectSearchDescription } from './search';
import { withAuth } from '../../shared/transport';

const showOnlyForObject = {
	resource: ['object'],
};

export const objectDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForObject,
		},
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search custom objects',
				description: 'Search for custom objects by criteria',
				routing: {
					request: {
						method: 'POST',
						url: '=/api/v1/object/{{$parameter.customObjectType}}/search',
					},
					send: {
						preSend: [
							withAuth(),
							async function (
								this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
								requestOptions: IHttpRequestOptions,
							): Promise<IHttpRequestOptions> {
								const searchCriteria = this.getNodeParameter(
									'searchCriteria',
									0,
									{},
								) as IDataObject;
								const options = this.getNodeParameter('options', 0, {}) as IDataObject;

								// Build the query values array for the request body
								const queryValues = [];
								if (searchCriteria.queryValues && Array.isArray(searchCriteria.queryValues)) {
									for (const field of searchCriteria.queryValues) {
										queryValues.push({
											name: field.name,
											value: field.value,
											type: field.type,
										});
									}
								}

								// Set the request body to the query values array
								requestOptions.body = queryValues;

								// Add pagination parameters if enabled
								if (options.enablePagination) {
									requestOptions.qs = {
										pageSize: options.pageSize || 50,
										pageNumber: options.pageNumber || 0,
									};
								}

								return requestOptions;
							},
						],
					},
				},
			},
		],
		default: 'search',
	},
	...objectSearchDescription,
];
