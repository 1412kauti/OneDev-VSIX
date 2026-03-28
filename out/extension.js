"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const projectsProvider_1 = require("./projectsProvider");
function getServers() {
    return vscode.workspace.getConfiguration('onedev').get('servers', []);
}
function getActiveServer() {
    const activeId = vscode.workspace.getConfiguration('onedev').get('activeServer');
    const servers = getServers();
    return servers.find(s => s.id === activeId) || servers[0];
}
function updateStatusBar(bar) {
    const active = getActiveServer();
    if (active) {
        bar.text = `$(server) OneDev: ${active.label}`;
        bar.tooltip = `Active server: ${active.url}\nClick to switch`;
        bar.show();
    }
    else {
        bar.text = `$(server) OneDev: No server`;
        bar.tooltip = 'Click to configure a server';
        bar.show();
    }
}
async function switchServer(bar, projectsProvider) {
    const servers = getServers();
    if (!servers.length) {
        vscode.window.showErrorMessage('No OneDev servers configured. Add them in Settings → OneDev.');
        return;
    }
    const picked = await vscode.window.showQuickPick(servers.map(s => ({ label: s.label, description: s.url, id: s.id })), { placeHolder: 'Select active OneDev server' });
    if (!picked) {
        return;
    }
    await vscode.workspace.getConfiguration('onedev')
        .update('activeServer', picked.id, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`OneDev: switched to ${picked.label}`);
    updateStatusBar(bar);
    refreshProjects(projectsProvider);
}
function refreshProjects(projectsProvider) {
    const active = getActiveServer();
    if (active) {
        projectsProvider.update(active.url, active.username, active.token); // ← username added
    }
}
function activate(context) {
    const projectsProvider = new projectsProvider_1.ProjectsProvider();
    vscode.window.registerTreeDataProvider('onedevProjects', projectsProvider);
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.command = 'onedev.switchServer';
    context.subscriptions.push(statusBar);
    updateStatusBar(statusBar);
    refreshProjects(projectsProvider);
    context.subscriptions.push(vscode.commands.registerCommand('onedev.switchServer', () => switchServer(statusBar, projectsProvider)));
    context.subscriptions.push(vscode.commands.registerCommand('onedev.refreshProjects', () => refreshProjects(projectsProvider)));
    context.subscriptions.push(vscode.commands.registerCommand('onedev.openProjectInBrowser', (url) => {
        vscode.env.openExternal(vscode.Uri.parse(url));
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('onedev')) {
            updateStatusBar(statusBar);
            refreshProjects(projectsProvider);
        }
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map