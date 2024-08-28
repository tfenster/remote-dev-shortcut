// from https://github.com/microsoft/vscode-azurevirtualmachines/blob/main/src/extensionVariables.ts / https://github.com/microsoft/vscode-azurevirtualmachines/blob/0094c5cb654616e2828ff8c8d6f4ff9feb2c55cd/src/extensionVariables.ts

import * as vscode from 'vscode';
import { IAzExtOutputChannel } from "@microsoft/vscode-azext-utils";
import { type AzureHostExtensionApi } from "@microsoft/vscode-azext-utils/hostapi";

export namespace ext {
    export let outputChannel: IAzExtOutputChannel;
    export let context: vscode.ExtensionContext;

    export let ignoreBundle: boolean | undefined;
    export const prefix: string = 'remoteDevShortcut';

    export let rgApi: AzureHostExtensionApi;
}