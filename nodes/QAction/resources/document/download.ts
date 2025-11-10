import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDocumentDownload = {
	operation: ['download'],
	resource: ['document'],
};

export const documentDownloadDescription: INodeProperties[] = [
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDocumentDownload,
		},
		placeholder: 'b6ad0118-6141-4073-8702-599a35df69aa',
		description: 'The system ID of the document to download',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForDocumentDownload,
		},
		options: [
			{
				displayName: 'Download Latest Version',
				name: 'latestVersion',
				type: 'boolean',
				default: true,
				description:
					'Whether to download the latest version of the document. If false, downloads the version specific to the document ID.',
			},
			{
				displayName: 'Prohibit PDF Conversion',
				name: 'prohibitPDFConversion',
				type: 'boolean',
				default: false,
				description: 'Whether to prohibit PDF conversion of the document',
			},
		],
	},
];
