import type {
	IDataObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeProperties,
	IN8nHttpFullResponse,
} from 'n8n-workflow';
import { documentDownloadDescription } from './download';
import { documentQueryDescription } from './query';
import { withAuth } from '../../shared/transport';

const showOnlyForDocument = {
	resource: ['document'],
};

export const documentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForDocument,
		},
		options: [
			{
				name: 'Download',
				value: 'download',
				action: 'Download a document',
				description: 'Download the contents of a document',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/document/{{$parameter.documentId}}/download',
						encoding: 'arraybuffer',
						returnFullResponse: true,
					},
					send: {
						preSend: [
							withAuth(),
							async function (
								this:
									| IExecuteFunctions
									| IExecuteSingleFunctions
									| ILoadOptionsFunctions
									| IHookFunctions,
								requestOptions: IHttpRequestOptions,
							): Promise<IHttpRequestOptions> {
								const options = this.getNodeParameter('options', 0, {}) as IDataObject;

								// Add query parameters
								requestOptions.qs = {
									latestVersion: options.latestVersion !== false,
									prohibitPDFConversion: options.prohibitPDFConversion || false,
								};

								return requestOptions;
							},
						],
					},
					output: {
						postReceive: [
							async function (
								this: IExecuteFunctions | IExecuteSingleFunctions,
								items: INodeExecutionData[],
								response: IN8nHttpFullResponse,
							): Promise<INodeExecutionData[]> {
								const documentId = this.getNodeParameter('documentId', 0) as string;

								// Extract filename from Content-Disposition header if available
								const contentDisposition = response.headers['content-disposition'] as string;
								let fileName = `document_${documentId}`;

								if (contentDisposition) {
									const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
									if (matches && matches[1]) {
										fileName = matches[1].replace(/['"]/g, '');
									}
								}

								// Get content type
								const mimeType =
									(response.headers['content-type'] as string) || 'application/octet-stream';

								// Convert ArrayBuffer to Buffer
								const uint8Array = new Uint8Array(response.body as ArrayBuffer);
								const buffer = Buffer.from(uint8Array);

								// Use prepareBinaryData with the buffer
								const binaryData = await this.helpers.prepareBinaryData(
									buffer,
									fileName,
									mimeType,
								);

								// Return as binary data
								return items.map(() => ({
									json: {
										documentId,
										fileName,
										mimeType,
										size: uint8Array.length,
									},
									binary: {
										data: binaryData,
									},
								}));
							},
						],
					},
				},
			},
			{
				name: 'Query',
				value: 'query',
				action: 'Query documents',
				description: 'Query for documents using search criteria',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/document/query',
					},
					send: {
						preSend: [
							withAuth(),
							async function (
								this:
									| IExecuteFunctions
									| IExecuteSingleFunctions
									| ILoadOptionsFunctions
									| IHookFunctions,
								requestOptions: IHttpRequestOptions,
							): Promise<IHttpRequestOptions> {
								const classificationIds = this.getNodeParameter('classificationIds', 0, '') as string;
								const documentTypeIds = this.getNodeParameter('documentTypeIds', 0, '') as string;
								const queryFields = this.getNodeParameter('queryFields', 0, {}) as IDataObject;
								const options = this.getNodeParameter('options', 0, {}) as IDataObject;

								// Build the request body
								const body: IDataObject = {};

								// Parse comma-separated classification IDs
								if (classificationIds.trim()) {
									body.classificationIds = classificationIds
										.split(',')
										.map((id) => id.trim())
										.filter((id) => id.length > 0);
								}

								// Parse comma-separated document type IDs
								if (documentTypeIds.trim()) {
									body.documentTypeIds = documentTypeIds
										.split(',')
										.map((id) => id.trim())
										.filter((id) => id.length > 0);
								}

								// Build the query fields array
								const fields = [];
								if (queryFields.fields && Array.isArray(queryFields.fields)) {
									for (const field of queryFields.fields) {
										fields.push({
											name: field.name,
											value: field.value,
											type: field.type,
										});
									}
								}
								if (fields.length > 0) {
									body.fields = fields;
								}

								requestOptions.body = body;

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
		default: 'download',
	},
	...documentDownloadDescription,
	...documentQueryDescription,
];
