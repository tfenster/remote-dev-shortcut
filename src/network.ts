import * as vscode from 'vscode';
import { VirtualMachine } from "@azure/arm-compute";
import { NetworkManagementClient } from "@azure/arm-network";
import { ext } from "./extensionVariables";
import { showErrorAndLog } from './message';
import { AzExtTreeItem, IActionContext } from '@microsoft/vscode-azext-utils';
import { createNetworkClient } from './clients';

export async function getNetworkName(vm: VirtualMachine, context: IActionContext, subscription: AzExtTreeItem): Promise<string | undefined> {
    const config = vscode.workspace.getConfiguration('remote-dev-shortcut');
    const sshHostName = config.get<string>('sshHostName');
    if (sshHostName) {
        return sshHostName;
    }

    let resourceGroupName = config.get<string>('resourceGroupName');
    if (resourceGroupName === undefined) {
        showErrorAndLog('No resource group name configured. Please do so in the extension settings.');
        return;
    }

    const networkInterfaceId = vm.networkProfile?.networkInterfaces?.[0]?.id;
    if (!networkInterfaceId) {
        showErrorAndLog(`No network interface found for VM "${vm.name}".`);
        return;
    }

    const networkInterfaceName = networkInterfaceId.split('/').pop();
    if (!networkInterfaceName) {
        showErrorAndLog(`Failed to parse network interface name from ID "${networkInterfaceId}".`);
        return;
    }

    const networkClient: NetworkManagementClient = await createNetworkClient([context, subscription.subscription]);
    const networkInterface = await networkClient.networkInterfaces.get(resourceGroupName, networkInterfaceName);

    const publicIpId = networkInterface.ipConfigurations?.[0]?.publicIPAddress?.id;
    if (!publicIpId) {
        showErrorAndLog(`No public IP address found for network interface "${networkInterfaceName}".`);
        return;
    }

    const publicIpName = publicIpId.split('/').pop();
    if (!publicIpName) {
        showErrorAndLog(`Failed to parse public IP address name from ID "${publicIpId}".`);
        return;
    }

    const publicIp = await networkClient.publicIPAddresses.get(resourceGroupName, publicIpName);
    const fqdn = publicIp.dnsSettings?.fqdn;
    ext.outputChannel.appendLog(`FQDN: ${fqdn}`);
    if (!fqdn) {
        showErrorAndLog(`No FQDN found for public IP address "${publicIpName}".`);
        return;
    } else {
        return fqdn;
    }
}