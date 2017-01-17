var vscode = require('vscode');
var reactInstyle = require("react-instyle");
var nodeFS = require('fs');

function activate(context) {
    var subscriptions = [];
    vscode.workspace.onDidSaveTextDocument(function (currentDocument) {
        var convertor = new reactInstyle.Convertor();
        var includePaths = [currentDocument.fileName];

        convertor.setIncludePath(includePaths);
        convertor.convert(currentDocument.getText(), currentDocument.languageId, "react_file").then(function (ret) {
            // Document conversion took place, check for errors first
            var errors = ret.errors.map(function (e) {
                if (e.file === convertor.UNKNOWN_SOURCE) {
                    e.file = currentDocument.fileName;
                }

                return e;
            })

            if (errors.length) {
                var e = errors[0];

                vscode.window.showErrorMessage(
                    e.file.split('/').slice(-1) + ' ln ' + e.line + ' col ' + e.column + ' - ' + e.message.slice(0,1).toUpperCase() + e.message.slice(1)
                );

                return;
            }

            // No errors, write the new document contents
            try {
                nodeFS.writeFileSync(currentDocument.fileName.split('.').slice(0, -1) + '.js', ret.formatted, { encoding: 'utf8' });
            } catch (e) {
                vscode.window.showErrorMessage("Conversion error :: Unable to write converted file:  " + e.message);
            }
        });
    }, vscode, subscriptions);

    context.subscriptions.push(vscode.Disposable.from(subscriptions););
}

// Export public methods
exports.activate = activate;
exports.deactivate = function deactivate() {};