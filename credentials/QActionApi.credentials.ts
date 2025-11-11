import type { ICredentialTestRequest, ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class QActionApi implements ICredentialType {
	name = 'qActionApi';
	displayName = 'QAction API';
	documentationUrl = 'https://docs.qaction.com';
	icon: Icon = {
		light: 'file:../icons/qaction.svg',
		dark: 'file:../icons/qaction.dark.svg',
	};
	properties: INodeProperties[] = [
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'https://api.qaction.com',
			placeholder: 'https://api.qaction.com',
			description: 'The base URL of your QAction environment',
			required: true,
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			description: 'The Client ID for QAction API authentication',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The API Key for QAction API authentication',
			required: true,
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl}}',
			url: '/api/v1/authentication/login',
			method: 'POST',
			headers: {
				'X-Client-Id': '={{$credentials.clientId}}',
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};
}
