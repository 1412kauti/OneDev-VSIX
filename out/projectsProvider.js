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
exports.ProjectsProvider = void 0;
const vscode = __importStar(require("vscode"));
const oneDevApi_1 = require("./oneDevApi");
class ProjectsProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    serverUrl = '';
    username = '';
    token = '';
    update(serverUrl, username, token) {
        this.serverUrl = serverUrl;
        this.username = username;
        this.token = token;
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren() {
        if (!this.serverUrl || !this.token) {
            return [new ProjectItem('No server configured', '', vscode.TreeItemCollapsibleState.None)];
        }
        try {
            const projects = await (0, oneDevApi_1.fetchProjects)(this.serverUrl, this.username, this.token);
            if (!projects.length) {
                return [new ProjectItem('No projects found', '', vscode.TreeItemCollapsibleState.None)];
            }
            return projects.map(p => new ProjectItem(p.name, p.path, vscode.TreeItemCollapsibleState.None, this.serverUrl));
        }
        catch (e) {
            return [new ProjectItem(`Error: ${e.message}`, '', vscode.TreeItemCollapsibleState.None)];
        }
    }
}
exports.ProjectsProvider = ProjectsProvider;
class ProjectItem extends vscode.TreeItem {
    projectPath;
    constructor(label, projectPath, collapsibleState, serverUrl) {
        super(label, collapsibleState);
        this.projectPath = projectPath;
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
//# sourceMappingURL=projectsProvider.js.map