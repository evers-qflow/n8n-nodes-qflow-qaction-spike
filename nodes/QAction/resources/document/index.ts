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
		],
		default: 'download',
	},
	...documentDownloadDescription,
];
