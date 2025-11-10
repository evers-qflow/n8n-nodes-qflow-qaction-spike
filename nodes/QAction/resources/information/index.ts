import type { INodeProperties } from 'n8n-workflow';
import { informationGetBuildDescription } from './getBuild';
import { withAuth } from '../../shared/transport';

const showOnlyForInformation = {
	resource: ['information'],
};

export const informationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForInformation,
		},
		options: [
			{
				name: 'Get Build Info',
				value: 'getBuild',
				action: 'Get build information',
				description: 'Get the current QAction build information including version and commit hashes',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/information/build',
					},
					send: {
						preSend: [withAuth()],
					},
				},
			},
		],
		default: 'getBuild',
	},
	...informationGetBuildDescription,
];
