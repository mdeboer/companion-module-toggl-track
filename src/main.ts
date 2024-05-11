import {
	DropdownChoice,
	InstanceBase,
	InstanceStatus,
	runEntrypoint,
	SomeCompanionConfigField,
} from '@companion-module/base'
import { ModuleVariables } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { ModuleActions } from './actions.js'
import { ModuleFeedbacks } from './feedbacks.js'
import { DateTime } from 'luxon'
import type { ModuleConfigValues } from './types.d.ts'
import { Toggl } from './toggl.js'

export class ModuleInstance extends InstanceBase<ModuleConfigValues> {
	config!: ModuleConfigValues
	variables: ModuleVariables
	feedbacks: ModuleFeedbacks
	actions: ModuleActions

	toggl: Toggl

	displayTimer: any
	projects: DropdownChoice[] = []

	constructor(internal: unknown) {
		super(internal)

		this.variables = new ModuleVariables(this)
		this.feedbacks = new ModuleFeedbacks(this)
		this.actions = new ModuleActions(this)

		this.toggl = new Toggl()
	}

	async init(config: ModuleConfigValues): Promise<void> {
		this.config = config

		this.variables.setDefinitions()
		this.feedbacks.setDefinitions()

		this.toggl.apiToken = config.apiToken

		const tokenValid = await this.checkApiToken()

		if (tokenValid) {
			await this.actions.updateProjects()
			await this.actions.updateTimeEntries()
		}

		this.actions.update()

		this.displayTimer = setInterval(() => this.updateCurrentTimerDuration(), 1000)
	}

	async destroy(): Promise<void> {
		if (this.displayTimer) {
			clearInterval(this.displayTimer)
		}

		this.projects = []
	}

	async configUpdated(config: ModuleConfigValues): Promise<void> {
		this.config = config

		this.toggl.apiToken = config.apiToken

		const tokenValid = await this.checkApiToken()

		if (tokenValid) {
			await this.actions.updateProjects()
			await this.actions.updateTimeEntries()
		}

		this.actions.update()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return [
			{
				type: 'textinput',
				id: 'apiToken',
				label: 'Personal API token',
				width: 12,
				required: true,
			},
		]
	}

	updateCurrentTimerDuration(): void {
		const currentTimer = this.toggl.currentTimer

		if (typeof currentTimer === 'undefined') {
			return
		}

		const now = DateTime.now()

		this.setVariableValues({
			currentDuration: now
				.diff(DateTime.fromISO(currentTimer.start), ['hours', 'minutes', 'seconds'])
				.toFormat('hh:mm:ss'),
			currentDurationRaw: Number.parseInt(now.diff(DateTime.fromISO(currentTimer.start), ['seconds']).toFormat('s')),
		})
	}

	/**
	 * Validate API token.
	 *
	 * Validates the API token in the config and updates the module status accordingly.
	 */
	async checkApiToken(): Promise<boolean> {
		this.updateStatus(InstanceStatus.Connecting)

		const valid = await this.toggl.checkApiToken()

		this.updateStatus(valid ? InstanceStatus.Ok : InstanceStatus.ConnectionFailure)

		return valid
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
