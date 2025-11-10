import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { documentDescription } from './resources/document';
import { informationDescription } from './resources/information';
import { objectDescription } from './resources/object';

export class QAction implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'QAction',
		name: 'qAction',
		usableAsTool: true,
		icon: {
			light: 'file:../../icons/qaction.svg',
			dark: 'file:../../icons/qaction.dark.svg',
		},
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume QAction API',
		defaults: {
			name: 'QAction',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'qActionApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.apiUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Document',
						value: 'document',
						description: 'Work with documents',
					},
					{
						name: 'Information',
						value: 'information',
						description: 'Get system and build information',
					},
					{
						name: 'Object',
						value: 'object',
						description: 'Work with custom objects',
					},
				],
				default: 'information',
			},
			...documentDescription,
			...informationDescription,
			...objectDescription,
		],
	};
}
