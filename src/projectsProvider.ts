import * as vscode from 'vscode';
import { fetchProjects, OneDevProject } from './oneDevApi';

export class ProjectsProvider implements vscode.TreeDataProvider<ProjectItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private serverUrl: string = '';
  private username: string = '';
  private token: string = '';

  update(serverUrl: string, username: string, token: string) {
    this.serverUrl = serverUrl;
    this.username = username;
    this.token = token;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ProjectItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<ProjectItem[]> {
    if (!this.serverUrl || !this.token) {
      return [new ProjectItem('No server configured', '', vscode.TreeItemCollapsibleState.None)];
    }

    try {
      const projects = await fetchProjects(this.serverUrl, this.username, this.token);
      if (!projects.length) {
        return [new ProjectItem('No projects found', '', vscode.TreeItemCollapsibleState.None)];
      }
      return projects.map(p => new ProjectItem(p.name, p.path, vscode.TreeItemCollapsibleState.None, this.serverUrl));
    } catch (e: any) {
      return [new ProjectItem(`Error: ${e.message}`, '', vscode.TreeItemCollapsibleState.None)];
    }
  }
}

class ProjectItem extends vscode.TreeItem {
  constructor(
    label: string,
    public readonly projectPath: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    serverUrl?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = projectPath;
    this.iconPath = new vscode.ThemeIcon('repo');

    if (serverUrl && projectPath) {
      this.command = {
        command: 'onedev.openProjectInBrowser',
        title: 'Open in Browser',
        arguments: [`${serverUrl}/${projectPath}`]
      };
    }
  }
}