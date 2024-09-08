# remote-dev-shortcut README

Adds shortcuts for remote development (SSH and devcontainers)

## Requirements

Requires the "Azure Resources for Visual Studio Code" Extension (https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureresourcegroups). You need to be logged in there and have it set up so that the configured VM is visible.

## Extension Settings

This extension contributes the following settings:

* `remote-dev-shortcut.subscriptionName`: The name of the subscription where the dev VM is located        
* `remote-dev-shortcut.resourceGroupName`: The name of the resource group where the dev VM is located
* `remote-dev-shortcut.vmName`: The name of the dev VM
* `remote-dev-shortcut.sshHostName`: The host name of the dev VM, e.g. as configured in your SSH config. If this is not provided, the extension will use the public FQDN of the VM according to Azure

## Known Issues

None at the moment

## Release Notes

### 1.0.0

Initial release