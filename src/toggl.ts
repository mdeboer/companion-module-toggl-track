import type { TogglProject, TogglTimer, TogglWorkspace } from './types.d.ts'
import { Got, got, HTTPError } from 'got'
import { DateTime } from 'luxon'

export class Toggl {
	private _http: Got

	private _currentTimer: TogglTimer | undefined = undefined
	private _lastTimer: TogglTimer | undefined = undefined

	private _projects: TogglProject[] = []
	private _workspaces: { [keyof: number]: TogglWorkspace } = []

	constructor(apiToken = '') {
		this._http = got.extend({
			prefixUrl: 'https://api.track.toggl.com/api/v9/',
			username: apiToken,
			password: 'api_token',
			throwHttpErrors: true,
		})
	}

	public set apiToken(apiToken: string) {
		this._http = this._http.extend({
			username: apiToken,
		})
	}

	/**
	 * @throws RequestError
	 */
	public async checkApiToken(): Promise<boolean> {
		try {
			const resp = await this._http.get('me/workspaces')
			return resp.statusCode === 200
		} catch (ex) {
			if (ex instanceof HTTPError) {
				return false
			}

			throw ex
		}
	}

	public get projects(): TogglProject[] {
		return this._projects
	}

	/**
	 * Update projects.
	 *
	 * @throws RequestError
	 */
	public async updateProjects(): Promise<TogglProject[]> {
		const projects: TogglProject[] = []

		const data = await this._http.get('me/projects').json<any[]>()

		for (const project of data) {
			projects.push({
				id: project.id,
				name: project.name,
				workspace_id: project.workspace_id,
			})
		}

		this._projects = projects

		return projects
	}

	public get workspace(): TogglWorkspace | undefined {
		if (Object.keys(this._workspaces).length === 0) {
			return undefined
		}

		return this._workspaces[Object.keys(this._workspaces)[0] as unknown as number]
	}

	public get workspaces(): { [keyof: number]: TogglWorkspace } {
		return this._workspaces
	}

	/**
	 * Update workspaces.
	 *
	 * @throws RequestError
	 */
	public async updateWorkspaces(): Promise<{ [keyof: number]: TogglWorkspace }> {
		const workspaces: { [keyof: number]: TogglWorkspace } = []

		const data = await this._http.get('me/workspaces').json<any[]>()

		for (const workspace of data) {
			workspaces[workspace.id] = {
				id: workspace.id,
				name: workspace.name,
				premium: workspace.premium,
			}
		}

		this._workspaces = workspaces

		return workspaces
	}

	public get currentTimer(): TogglTimer | undefined {
		return this._currentTimer
	}

	public async startTimer(
		description: string,
		workspace: number,
		project: number | undefined = undefined,
		tags: string[] = [],
		billable = false
	): Promise<TogglTimer> {
		this._currentTimer = await this._http
			.post(`workspaces/${workspace}/time_entries`, {
				json: {
					billable: billable,
					created_with: 'companion',
					description: description,
					duration: -1,
					start: DateTime.now().toISO(),
					tags: tags,
					workspace_id: workspace,
					project_id: project,
				},
			})
			.json<TogglTimer>()

		return this._currentTimer
	}

	public async stopTimer(): Promise<void> {
		if (typeof this._currentTimer === 'undefined') {
			return
		}

		await this._http.patch(`workspaces/${this._currentTimer.workspace_id}/time_entries/${this._currentTimer.id}/stop`)

		this._currentTimer = undefined
	}

	public async updateTimers(): Promise<{ current: TogglTimer | undefined; last: TogglTimer | undefined }> {
		const resp = await this._http
			.get('me/time_entries', {
				searchParams: {
					meta: true,
				},
			})
			.json<TogglTimer[]>()

		let currentTimer: TogglTimer | undefined = resp[0] ?? undefined
		let lastTimer: TogglTimer | undefined = resp[1] ?? undefined

		if (currentTimer && currentTimer.duration >= 0) {
			currentTimer = undefined
			lastTimer = resp[0]
		}

		this._currentTimer = currentTimer
		this._lastTimer = lastTimer

		return {
			current: this._currentTimer,
			last: this._lastTimer,
		}
	}
}
