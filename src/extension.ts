import * as vscode from 'vscode';
import { ProjectsProvider } from './projectsProvider';

interface OneDevServer {
  id: string;
  label: string;
  url: string;
  username: string;  // ← added
  token: string;
}

function getServers(): OneDevServer[] {
  return vscode.workspace.getConfiguration('onedev').get<OneDevServer[]>('servers', []);
}

function getActiveServer(): OneDevServer | undefined {
  const activeId = vscode.workspace.getConfiguration('onedev').get<string>('activeServer');
  const servers = getServers();
  return servers.find(s => s.id === activeId) || servers[0];
}

function updateStatusBar(bar: vscode.StatusBarItem) {
  const active = getActiveServer();
  if (active) {
    bar.text = `$(server) OneDev: ${active.label}`;
    bar.tooltip = `Active server: ${active.url}\nClick to switch`;
    bar.show();
  } else {
    bar.text = `$(server) OneDev: No server`;
    bar.tooltip = 'Click to configure a server';
    bar.show();
  }
}

async function switchServer(bar: vscode.StatusBarItem, projectsProvider: ProjectsProvider) {
  const servers = getServers();

  if (!servers.length) {
    vscode.window.showErrorMessage('No OneDev servers configured. Add them in Settings → OneDev.');
    return;
  }

  const picked = await vscode.window.showQuickPick(
    servers.map(s => ({ label: s.label, description: s.url, id: s.id })),
    { placeHolder: 'Select active OneDev server' }
  );

  if (!picked) { return; }

  await vscode.workspace.getConfiguration('onedev')
    .update('activeServer', picked.id, vscode.ConfigurationTarget.Global);

  vscode.window.showInformationMessage(`OneDev: switched to ${picked.label}`);
  updateStatusBar(bar);
  refreshProjects(projectsProvider);
}

function refreshProjects(projectsProvider: ProjectsProvider) {
  const active = getActiveServer();
  if (active) {
    projectsProvider.update(active.url, active.username, active.token);  // ← username added
  }
}

export function activate(context: vscode.ExtensionContext) {
  const projectsProvider = new ProjectsProvider();
  vscode.window.registerTreeDataProvider('onedevProjects', projectsProvider);

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.command = 'onedev.switchServer';
  context.subscriptions.push(statusBar);
  updateStatusBar(statusBar);

  refreshProjects(projectsProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('onedev.switchServer', () => switchServer(statusBar, projectsProvider))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('onedev.refreshProjects', () => refreshProjects(projectsProvider))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('onedev.openProjectInBrowser', (url: string) => {
      vscode.env.openExternal(vscode.Uri.parse(url));
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('onedev')) {
        updateStatusBar(statusBar);
        refreshProjects(projectsProvider);
      }
    })
  );
}

export function deactivate() {}