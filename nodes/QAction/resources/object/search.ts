import type { INodeProperties } from 'n8n-workflow';

const showOnlyForObjectSearch = {
	operation: ['search'],
	resource: ['object'],
};

export const objectSearchDescription: INodeProperties[] = [
	{
		displayName: 'Custom Object Type',
		name: 'customObjectType',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForObjectSearch,
		},
		placeholder: 'QPerson',
		description: 'The type of the custom object to search (e.g., QPerson, QInvoice)',
	},
	{
		displayName: 'Search Criteria',
		name: 'searchCriteria',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: showOnlyForObjectSearch,
		},
		placeholder: 'Add Search Field',
		description: 'Fields to search by',
		options: [
			{
				name: 'queryValues',
				displayName: 'Query Fields',
				values: [
					{
						displayName: 'Field Name',
						name: 'name',
						type: 'string',
						default: '',
						required: true,
						placeholder: 'FirstName',
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
			show: showOnlyForObjectSearch,
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
