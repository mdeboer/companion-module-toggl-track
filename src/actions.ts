import type { ModuleInstance } from './main.js'
import type { ModuleVariableValues, TogglTimer } from './types.d.ts'
import { DateTime, Duration } from 'luxon'
import { CompanionActionEvent } from '@companion-module/base/dist/index.js'
import { DropdownChoice } from '@companion-module/base'

export class ModuleActions {
	private projects: DropdownChoice[] = [{ id: '', label: 'None' }]

	constructor(private module: ModuleInstance) {}

	update(): void {
		this.module.setActionDefinitions({
			update_time_entries: {
				name: 'Update time entries',
				options: [],
				callback: async () => this.updateTimeEntries(),
			},
			update_projects: {
				name: 'Update projects',
				options: [],
				callback: async () => {
					await this.updateProjects()

					this.update()
				},
			},
			start_timer: {
				name: 'Start timer',
				options: [
					{
						id: 'description',
						default: '',
						label: 'Description',
						type: 'textinput',
					},
					{
						id: 'project',
						default: this.projects[0].id,
						label: 'Project',
						type: 'dropdown',
						choices: this.projects,
					},
					{
						id: 'tags',
						default: '',
						label: 'Tags',
						type: 'textinput',
						tooltip: 'Comma separated list of tags',
					},
					{
						id: 'billable',
						default: false,
						label: 'Billable',
						type: 'checkbox',
						tooltip: 'Only available in certain plans.',
					},
				],
				callback: async (event) => this.startTimer(event),
			},
			stop_timer: {
				name: 'Stop running timer',
				options: [],
				callback: async () => this.stopTimer(),
			},
		})
	}

	public async startTimer(event: CompanionActionEvent): Promise<void> {
		let projectId: number | undefined = undefined
		let workspaceId: number | undefined = this.module.toggl.workspace?.id
		const tags = (event.options.tags as string).split(/\s*,\s*/).filter((v) => v.trim() !== '')

		if (event.options.project !== '') {
			const p = (event.options.project as string).split('|', 2)

			projectId = Number.parseInt(p[0])
			workspaceId = Number.parseInt(p[1])
		}

		if (typeof workspaceId === 'undefined') {
			this.module.log(
				'error',
				'Could not start timer, no project selected and no workspaces are known. Try updating projects.'
			)
			return
		}

		try {
			const timer = await this.module.toggl.startTimer(
				event.options.description as string,
				workspaceId,
				projectId,
				tags,
				event.options.billable as boolean
			)
			this.module.variables.update(this._getCurrentTimerVariables(timer))

			this.module.log('info', `Started timer with ID: ${timer.id}`)
		} catch (ex) {
			this.module.log('error', `Could not start timer: ${ex}`)
			return
		} finally {
			this.module.feedbacks.check('timerRunning')
		}
	}

	public async stopTimer(): Promise<void> {
		try {
			await this.module.toggl.stopTimer()
			this.module.log('info', 'Stopped timer')
		} catch (ex) {
			this.module.log('error', `Could not stop timer: ${ex}`)
			return
		} finally {
			this.module.variables.clearCurrent()
			this.module.feedbacks.check('timerRunning')
		}
	}

	public async updateProjects(): Promise<void> {
		try {
			await this.module.toggl.updateWorkspaces()
		} catch (ex) {
			this.module.log('error', `Error updating workspaces: ${ex}`)
			return
		}

		try {
			await this.module.toggl.updateProjects()
		} catch (ex) {
			this.module.log('error', `Error updating projects: ${ex}`)
			return
		}

		const projects: DropdownChoice[] = [{ id: '', label: 'None' }]

		for (const project of this.module.toggl.projects) {
			projects.push({
				id: `${project.id}|${project.workspace_id}`,
				label: project.name,
			})
		}

		this.projects = projects

		this.module.log('info', 'Updated projects')
	}

	public async updateTimeEntries(): Promise<void> {
		try {
			const { current, last } = await this.module.toggl.updateTimers()

			let variables = this.module.variables.empty

			// Set variables for current timer.
			if (current) {
				variables = Object.assign(variables, this._getCurrentTimerVariables(current))
			}

			// Set variables for last timer.
			if (last) {
				variables = Object.assign(variables, {
					lastClient: last.client_name ?? undefined,
					lastDescription: last.description,
					lastDuration: Duration.fromObject({ seconds: last.duration }).toFormat('hh:mm:ss'),
					lastDurationRaw: last.duration,
					lastProject: last.project_name ?? undefined,
					lastProjectColor: last.project_color ?? undefined,
					lastProjectId: last.project_id ?? undefined,
					lastWorkspace: this.module.toggl.workspaces[last.workspace_id].name ?? undefined,
					lastWorkspaceId: last.workspace_id,
				} as ModuleVariableValues)
			}

			this.module.variables.update(variables)

			this.module.log('info', 'Updated time entries')
		} catch (ex) {
			this.module.log('error', `Error updating time entries: ${ex}`)
			return
		} finally {
			this.module.feedbacks.check('timerRunning')
		}
	}

	private _getCurrentTimerVariables(timer: TogglTimer): ModuleVariableValues {
		const now = DateTime.now()

		return {
			currentClient: timer.client_name ?? undefined,
			currentDescription: timer.description,
			currentDuration: now.diff(DateTime.fromISO(timer.start), ['hours', 'minutes', 'seconds']).toFormat('hh:mm:ss'),
			currentDurationRaw: Number.parseInt(now.diff(DateTime.fromISO(timer.start), ['seconds']).toFormat('s')),
			currentId: timer.id,
			currentProject: timer.project_name ?? undefined,
			currentProjectColor: timer.project_color ?? undefined,
			currentProjectId: timer.project_id ?? undefined,
			currentStart: timer.start,
			currentWorkspace: this.module.toggl.workspaces[timer.workspace_id]?.name,
			currentWorkspaceId: timer.workspace_id,
			running: true,
		} as ModuleVariableValues
	}
}
