import * as vscode from 'vscode';
import { ComputeManagementClient, VirtualMachine } from "@azure/arm-compute";
import { ResolvedAppResourceBase, ResolvedAppResourceTreeItem } from "@microsoft/vscode-azext-utils/hostapi";
import { ext } from "./extensionVariables";
import { showErrorAndLog, showInfoAndLog } from "./message";
import { AzExtTreeItem, IActionContext } from '@microsoft/vscode-azext-utils';
import { createComputeClient } from './clients';

export async function getStartedVmAndSubscription(context: IActionContext): Promise<{ vm: VirtualMachine, subscription: AzExtTreeItem } | undefined> {
    const vmRgCc = await getVmAndResourceGroupNameAndComputeClient(context);
    if (!vmRgCc) {
        return;
    }
    const running = vmRgCc.vm.instanceView?.statuses?.find(s => s.code === 'PowerState/running') !== undefined;
    if (running) {
        ext.outputChannel.appendLog(`"${vmRgCc.vm.name}" is already running.`);
    } else {
        showInfoAndLog(`Starting "${vmRgCc.vm.name}"...`);
        await vmRgCc.computeClient.virtualMachines.beginStartAndWait(vmRgCc.resourceGroupName, vmRgCc.vm.name!);
        showInfoAndLog(`"${vmRgCc.vm.name}" has been started.`);
    }
    return { vm: vmRgCc.vm, subscription: vmRgCc.subscription };
}

export async function stopVm(context: IActionContext): Promise<void> {
    const vmRgCc = await getVmAndResourceGroupNameAndComputeClient(context);
    if (!vmRgCc) {
        return;
    }
    const deallocated = vmRgCc.vm.instanceView?.statuses?.find(s => s.code === 'PowerState/deallocated') !== undefined;
    if (deallocated) {
        showInfoAndLog(`"${vmRgCc.vm.name}" is already stopped.`);
    } else {
        showInfoAndLog(`Stopping "${vmRgCc.vm.name}"...`);
        await vmRgCc.computeClient.virtualMachines.beginDeallocateAndWait(vmRgCc.resourceGroupName, vmRgCc.vm.name!);
        showInfoAndLog(`"${vmRgCc.vm.name}" has been stopped.`);
    }
}

export async function selectAsDevVm(context: IActionContext, node?: ResolvedVirtualMachineTreeItem | any): Promise<void> {
    if (!node) {
        node = await ext.rgApi.pickAppResource<ResolvedVirtualMachineTreeItem>(context, {
            filter: { type: 'Microsoft.Compute/virtualMachines' },
        });
    }

    if (!node) {
        return;
    }

    const config = vscode.workspace.getConfiguration('remote-dev-shortcut');
    let subscriptionName: string;
    let resourceGroupName: string;
    let vmName: string;
    if (node.subscription !== undefined) {
        subscriptionName = node.subscription.subscriptionDisplayName;
        resourceGroupName = node.resourceGroup;
        vmName = node.name;
    } else {
        subscriptionName = node.resource.subscription.subscriptionDisplayName;
        resourceGroupName = node.resource.resourceGroup;
        vmName = node.resource.name;
    }
    config.update('subscriptionName', subscriptionName, vscode.ConfigurationTarget.Global);
    config.update('resourceGroupName', resourceGroupName, vscode.ConfigurationTarget.Global);
    config.update('vmName', vmName, vscode.ConfigurationTarget.Global);
    config.update('sshHost', "", vscode.ConfigurationTarget.Global);
    showInfoAndLog(`"${vmName}" has been configured as dev VM. Don't forget to update the SSH host setting if you have anything special set up in your SSH config file.`);

}

async function getVmAndResourceGroupNameAndComputeClient(context: IActionContext): Promise<{ vm: VirtualMachine, resourceGroupName: string, computeClient: ComputeManagementClient, subscription: AzExtTreeItem } | undefined> {
    const config = vscode.workspace.getConfiguration('remote-dev-shortcut');
    const subscriptionName = config.get<string>('subscriptionName');
    if (subscriptionName === undefined) {
        showErrorAndLog('No subscription name configured. Please do so in the extension settings.');
        return;
    }
    const resourceGroupName = config.get<string>('resourceGroupName');
    if (resourceGroupName === undefined) {
        showErrorAndLog('No resource group name configured. Please do so in the extension settings.');
        return;
    }
    const vmName = config.get<string>('vmName');
    if (vmName === undefined) {
        showErrorAndLog('No VM name configured. Please do so in the extension settings.');
        return;
    }
    const subscriptions = await ext.rgApi.appResourceTree.getChildren();
    const subscription = subscriptions.find(s => s.subscription.subscriptionDisplayName === subscriptionName);
    if (subscription === undefined) {
        showErrorAndLog(`Could not find subscription "${subscriptionName}". Make sure it appears in the Azure Resources extension.`);
        return;
    }
    const computeClient: ComputeManagementClient = await createComputeClient([context, subscription.subscription]);
    const vm = await computeClient.virtualMachines.get(resourceGroupName, vmName, { expand: 'instanceView' });
    return { vm, resourceGroupName, computeClient, subscription };
}


// from https://github.com/microsoft/vscode-azurevirtualmachines/blob/main/src/tree/VirtualMachineTreeItem.ts (https://github.com/microsoft/vscode-azurevirtualmachines/blob/22dbc210ec3a92982fb8d0a16a36a4267183c016/src/tree/VirtualMachineTreeItem.ts)
export interface ResolvedVirtualMachine extends ResolvedAppResourceBase {
    data: VirtualMachine;
    resourceGroup: string;
    getIpAddress(context: IActionContext): Promise<string>;
    getUser(): string;
    label: string;
    name: string;
}

export type ResolvedVirtualMachineTreeItem = ResolvedAppResourceTreeItem<ResolvedVirtualMachine> & AzExtTreeItem;