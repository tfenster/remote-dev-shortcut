import * as vscode from 'vscode';
import { ext } from './extensionVariables';

/**
 * Shows an error message and logs it to the output channel.
 * @param message The error message to show and log.
 */
export function showErrorAndLog(message: string): void {
    // Show the error message in a pop-up notification
    vscode.window.showErrorMessage(message);

    // Log the error message to the output channel
    if (ext.outputChannel) {
        ext.outputChannel.appendLine(`Error: ${message}`);
    }
}

/**
 * Shows an info message and logs it to the output channel.
 * @param message The info message to show and log.
 */
export function showInfoAndLog(message: string): void {
    // Show the info message in a pop-up notification
    vscode.window.showInformationMessage(message);

    // Log the info message to the output channel
    if (ext.outputChannel) {
        ext.outputChannel.appendLine(`Info: ${message}`);
    }
}