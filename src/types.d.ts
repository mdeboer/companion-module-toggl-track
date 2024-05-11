export interface ModuleConfigValues {
	apiToken: string
}

export type ModuleVariableValues = {
	currentClient: string | undefined
	currentDescription: string | undefined
	currentDuration: string
	currentDurationRaw: number
	currentId: number | undefined
	currentProject: string | undefined
	currentProjectColor: string | undefined
	currentProjectId: number | undefined
	currentStart: string | undefined
	currentWorkspace: string | undefined
	currentWorkspaceId: number | undefined
	lastClient: string | undefined
	lastDescription: string | undefined
	lastDuration: string
	lastDurationRaw: number
	lastProject: string | undefined
	lastProjectId: number | undefined
	lastProjectColor: string | undefined
	lastWorkspace: string | undefined
	lastWorkspaceId: number | undefined
	running: boolean
}

export type TogglTimer = {
	id: number
	workspace_id: number
	project_id?: number
	billable: boolean
	start: string
	stop?: string
	duration: number
	description: string
	tags: string[]
	project_name?: string
	project_color?: string
	client_name?: string
}

export type TogglProject = {
	id: number
	name: string
	workspace_id: number
}

export type TogglWorkspace = {
	id: number
	name: string
	premium: boolean
}
