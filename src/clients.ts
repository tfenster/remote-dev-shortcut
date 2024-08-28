// from https://github.com/microsoft/vscode-azurevirtualmachines/blob/main/src/utils/azureClients.ts / https://github.com/microsoft/vscode-azurevirtualmachines/blob/0094c5cb654616e2828ff8c8d6f4ff9feb2c55cd/src/utils/azureClients.ts

import { ComputeManagementClient } from '@azure/arm-compute';
import { NetworkManagementClient } from '@azure/arm-network';
import { AzExtClientContext, createAzureClient } from '@microsoft/vscode-azext-azureutils';

export async function createComputeClient(context: AzExtClientContext): Promise<ComputeManagementClient> {
    return createAzureClient(context, (await import('@azure/arm-compute')).ComputeManagementClient);
}

export async function createNetworkClient(context: AzExtClientContext): Promise<NetworkManagementClient> {
    return createAzureClient(context, (await import('@azure/arm-network')).NetworkManagementClient);
}