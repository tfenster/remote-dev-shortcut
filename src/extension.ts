import * as vscode from 'vscode';
import { createAzExtOutputChannel, IActionContext, registerCommandWithTreeNodeUnwrapping, registerUIExtensionVariables } from '@microsoft/vscode-azext-utils';
import { ext } from './extensionVariables';
import { getNetworkName } from './network';
import { getStartedVmAndSubscription, ResolvedVirtualMachineTreeItem, selectAsDevVm, stopVm } from './vm';
import { AzureHostExtensionApi } from '@microsoft/vscode-azext-utils/hostapi';

export async function activate(context: vscode.ExtensionContext) {
	ext.context = context;
	ext.ignoreBundle = true;
	ext.outputChannel = createAzExtOutputChannel('Remote Dev Shortcuts', ext.prefix);
	var resourceExtension = vscode.extensions.getExtension('ms-azuretools.vscode-azureresourcegroups');
	const api: AzureHostExtensionApi = resourceExtension?.exports.getApi("0.0.1");
	ext.rgApi = api;
	context.subscriptions.push(ext.outputChannel);
	registerUIExtensionVariables(ext);

	registerCommandWithTreeNodeUnwrapping('remote-dev-shortcut.startSSH', startVirtualMachine);
	registerCommandWithTreeNodeUnwrapping('remote-dev-shortcut.stopSSH', stopVirtualMachine);
	registerCommandWithTreeNodeUnwrapping('remote-dev-shortcut.selectAsDevVm', selectAsDevVirtualMachine);
}

async function startVirtualMachine(context: IActionContext): Promise<void> {
	const vmAndSubscription = await getStartedVmAndSubscription(context);
	if (!vmAndSubscription) {
		return;
	}

	const networkName = await getNetworkName(vmAndSubscription.vm, context, vmAndSubscription.subscription);
	if (networkName) {
		await vscode.commands.executeCommand('opensshremotes.openEmptyWindow', { host: networkName });
	}
}

async function stopVirtualMachine(context: IActionContext): Promise<void> {
	await stopVm(context);
}

async function selectAsDevVirtualMachine(context: IActionContext, node?: ResolvedVirtualMachineTreeItem): Promise<void> {
	await selectAsDevVm(context, node);
}

export function deactivate() { }