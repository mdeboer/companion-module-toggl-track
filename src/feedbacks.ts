import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export class ModuleFeedbacks {
	constructor(private module: ModuleInstance) {}

	public setDefinitions(): void {
		this.module.setFeedbackDefinitions({
			timerRunning: {
				name: 'Timer running',
				type: 'boolean',
				defaultStyle: {
					bgcolor: combineRgb(0, 255, 0),
					color: combineRgb(0, 0, 0),
				},
				options: [],
				callback: () => {
					return this.module.getVariableValue('running') === true
				},
			},
		})
	}

	public check(type: 'timerRunning'): void {
		this.module.checkFeedbacks(type)
	}
}
