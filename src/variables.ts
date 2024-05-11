import type { ModuleInstance } from './main.js'
import type { ModuleVariableValues } from './types.d.ts'

export class ModuleVariables {
	constructor(private module: ModuleInstance) {}

	public get empty(): ModuleVariableValues {
		return Object.assign({}, {
			currentClient: undefined,
			currentDescription: undefined,
			currentDuration: '00:00:00',
			currentDurationRaw: 0,
			currentId: undefined,
			currentProject: undefined,
			currentProjectColor: undefined,
			currentProjectId: undefined,
			currentStart: undefined,
			currentWorkspace: undefined,
			currentWorkspaceId: undefined,
			lastClient: undefined,
			lastDescription: undefined,
			lastDuration: '00:00:00',
			lastDurationRaw: 0,
			lastProject: undefined,
			lastProjectColor: undefined,
			lastProjectId: undefined,
			lastWorkspace: undefined,
			lastWorkspaceId: undefined,
			running: false,
		} as ModuleVariableValues)
	}

	public clear(): void {
		this.clearCurrent()
		this.clearLast()
	}

	public update(values: ModuleVariableValues): void {
		this.module.setVariableValues(values)
	}

	public clearCurrent(): void {
		this.module.setVariableValues({
			currentClient: undefined,
			currentDescription: undefined,
			currentDuration: '00:00:00',
			currentDurationRaw: 0,
			currentId: undefined,
			currentProject: undefined,
			currentProjectColor: undefined,
			currentProjectId: undefined,
			currentStart: undefined,
			currentWorkspace: undefined,
			currentWorkspaceId: undefined,
			running: false,
		})
	}

	public clearLast(): void {
		this.module.setVariableValues({
			lastClient: undefined,
			lastDescription: undefined,
			lastDuration: '00:00:00',
			lastDurationRaw: 0,
			lastProject: undefined,
			lastProjectColor: undefined,
			lastProjectId: undefined,
			lastWorkspace: undefined,
			lastWorkspaceId: undefined,
		})
	}

	public setDefinitions(): void {
		this.module.setVariableDefinitions([
			{ variableId: 'currentClient', name: 'Client name of running timer' },
			{ variableId: 'currentDescription', name: 'Description of running timer' },
			{ variableId: 'currentDuration', name: 'Duration of running timer' },
			{ variableId: 'currentDurationRaw', name: 'Raw duration of running timer' },
			{ variableId: 'currentId', name: 'ID of running timer' },
			{ variableId: 'currentProject', name: 'Project name of running timer' },
			{ variableId: 'currentProjectColor', name: 'Project color of running timer' },
			{ variableId: 'currentProjectId', name: 'Project ID of running timer' },
			{ variableId: 'currentStart', name: 'Start date/time of running timer' },
			{ variableId: 'currentWorkspace', name: 'Workspace name of running timer' },
			{ variableId: 'currentWorkspaceId', name: 'Workspace ID of running timer' },
			{ variableId: 'lastClient', name: 'Client name of last timer' },
			{ variableId: 'lastDescription', name: 'Description of last timer' },
			{ variableId: 'lastDuration', name: 'Duration of last timer' },
			{ variableId: 'lastDurationRaw', name: 'Raw duration of last timer' },
			{ variableId: 'lastProject', name: 'Project name of last timer' },
			{ variableId: 'lastProjectColor', name: 'Project color of last timer' },
			{ variableId: 'lastProjectId', name: 'Project name of last timer' },
			{ variableId: 'lastWorkspace', name: 'Workspace name of last timer' },
			{ variableId: 'lastWorkspaceId', name: 'Workspace ID of last timer' },
			{ variableId: 'running', name: 'Whether or not a timer is running' },
		])
	}
}
