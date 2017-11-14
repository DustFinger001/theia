/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
import { injectable, inject } from "inversify";
import { GitRepositoryProvider } from './git-repository-provider';
import { FrontendApplication, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { WidgetManager } from '@theia/core/lib/browser/widget-manager';
import { StatusBar, StatusBarAlignment } from "@theia/core/lib/browser/statusbar/statusbar";
import { Git } from '../common';

export const GIT_WIDGET_FACTORY_ID = 'git';

@injectable()
export class GitFrontendContribution implements FrontendApplicationContribution {
    constructor(
        @inject(WidgetManager) protected readonly widgetManager: WidgetManager,
        @inject(GitRepositoryProvider) protected readonly repositoryProvider: GitRepositoryProvider,
        @inject(Git) protected readonly git: Git,
        @inject(StatusBar) protected readonly statusbar: StatusBar
    ) { }

    onStart(app: FrontendApplication) {
        this.repositoryProvider.onDidChangeRepository(async currentRepo => {
            if (currentRepo) {
                const status = await this.git.status(currentRepo);
                if (status.branch) {
                    this.statusbar.setElement('git-repository-status', {
                        text: `$(code-fork) ${status.branch}`,
                        alignment: StatusBarAlignment.LEFT,
                        priority: 100
                    });
                }
            }
        });
        this.repositoryProvider.refresh();
    }

    async initializeLayout(app: FrontendApplication): Promise<void> {
        this.widgetManager.getOrCreateWidget(GIT_WIDGET_FACTORY_ID).then(widget => {
            app.shell.addToLeftArea(widget, {
                rank: 200
            });
        });
    }

}
