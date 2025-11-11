import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDocumentQuery = {
	operation: ['query'],
	resource: ['document'],
};

export const documentQueryDescription: INodeProperties[] = [
	{
		displayName: 'Classification IDs',
		name: 'classificationIds',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForDocumentQuery,
		},
		placeholder: 'classification-id-1, classification-id-2',
		description: 'Comma-separated list of classification IDs to filter by (optional)',
	},
	{
		displayName: 'Document Type IDs',
		name: 'documentTypeIds',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForDocumentQuery,
		},
		placeholder: 'doc-type-id-1, doc-type-id-2',
		description: 'Comma-separated list of document type IDs to filter by (optional)',
	},
	{
		displayName: 'Query Fields',
		name: 'queryFields',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: showOnlyForDocumentQuery,
		},
		placeholder: 'Add Query Field',
		description: 'Fields to search by',
		options: [
			{
				name: 'fields',
				displayName: 'Fields',
				values: [
					{
						displayName: 'Field Name',
						name: 'name',
						type: 'string',
						default: '',
						required: true,
						placeholder: 'DocumentTitle',
						description: 'The name of the field to search',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						required: true,
						description: 'The value to search for',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						default: 'PRIMITIVE',
						description: 'The type of query to perform',
						options: [
							{
								name: 'Date',
								value: 'DATE',
								description: 'Date value search',
							},
							{
								name: 'Date Range',
								value: 'DATE_RANGE',
								description: 'Search within a date range',
							},
							{
								name: 'Primitive',
								value: 'PRIMITIVE',
								description: 'Basic string/number value search',
							},
							{
								name: 'Text Query',
								value: 'TEXT_QUERY',
								description: 'Text search query',
							},
							{
								name: 'Text Query List',
								value: 'TEXT_QUERY_LIST',
								description: 'List of text search queries',
							},
						],
					},
				],
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForDocumentQuery,
		},
		options: [
			{
				displayName: 'Enable Pagination',
				name: 'enablePagination',
				type: 'boolean',
				default: false,
				description: 'Whether to enable pagination for results',
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 50,
				displayOptions: {
					show: {
						enablePagination: [true],
					},
				},
				description: 'Number of items per page',
			},
			{
				displayName: 'Page Number',
				name: 'pageNumber',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						enablePagination: [true],
					},
				},
				description: 'Page number (0-indexed)',
			},
		],
	},
];
