document.addEventListener('DOMContentLoaded', function() {
    var button = document.getElementById("make");
    var random = document.getElementById("random");
    var copyButton = document.getElementById("copy");
    var saveButton = document.getElementById("save");
    var whereUsePass = document.getElementById("whereUsePass");
    var notifications = document.querySelector('.notifications');

    button.addEventListener('click', function() {
        var minLength = document.getElementById("minLength").value;
        var includeUppercase = document.getElementById("includeUppercase").checked;
        var includeLowercase = document.getElementById("includeLowercase").checked;
        var includeNumbers = document.getElementById("includeNumbers").checked;
        var includeSymbols = document.getElementById("includeSymbols").checked;

        var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var lowercase = "abcdefghijklmnopqrstuvwxyz";
        var numbers = "0123456789";
        var symbols = "!@#$%^&*()";

        var chars = "";
        if (includeUppercase) chars += uppercase;
        if (includeLowercase) chars += lowercase;
        if (includeNumbers) chars += numbers;
        if (includeSymbols) chars += symbols;

        var password = "";
        for (var i = 0; i < minLength; i++) {
            var randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        random.textContent = password;
    });

    copyButton.addEventListener('click', function() {
        if (random.textContent.trim() === "") {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'No password to copy');
            return;
        }

        var range = document.createRange();
        range.selectNode(random);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

        try {
            var successful = document.execCommand('copy');
            if (successful) {
                createToast('success', 'fa-solid fa-circle-check', 'Success', 'Copied to clipboard: ' + random.textContent);
            } else {
                createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Unable to copy');
            }
        } catch (err) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Oops, unable to copy');
        }

        window.getSelection().removeAllRanges();
    });

    saveButton.addEventListener('click', async function() {
        if (random.textContent.trim() === "") {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'No password to save');
            return;
        }

        var passwordFor = whereUsePass.value;
        if (!passwordFor) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Please specify where the password will be used');
            return;
        }

        var fileType = prompt("Enter 'P' for Picture or 'T' for Text:");
        if (!fileType) return;

        if (fileType.toUpperCase() === 'P') {
            await savePasswordAsImage(passwordFor, random.textContent);
        } else if (fileType.toUpperCase() === 'T') {
            await savePasswordAsText(passwordFor, random.textContent);
        } else {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Invalid file type');
        }
    });

    async function savePasswordAsImage(passwordFor, password) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 200;
    
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
    
        context.fillStyle = '#000000';
        context.font = '20px monospace';
    
        // Add the "Password for" text
        context.fillText("Password for: " + passwordFor, 10, 50);
    
        // Add the password
        context.font = '30px monospace';
        context.fillText(password, 10, 100);
    
        // Add the current date and time
        const now = new Date();
        const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        context.font = '16px monospace';
        context.fillText("Created on: " + timeString, 10, 150);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'password.png',
                types: [{
                    description: 'PNG Files',
                    accept: {'image/png': ['.png']}
                }]
            });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            createToast('success', 'fa-solid fa-circle-check', 'Success', 'Password saved as image');
        } catch (err) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Unable to save file');
        }

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'password.png';
        downloadLink.click();
    }

    async function savePasswordAsText(passwordFor, password) {
        const now = new Date();
        const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        const textContent = `Password for: ${passwordFor}\nPassword: ${password}\nCreated on: ${timeString}`;

        const blob = new Blob([textContent], { type: 'text/plain' });
        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'password.txt',
                types: [{
                    description: 'Text Files',
                    accept: {'text/plain': ['.txt']}
                }]
            });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            createToast('success', 'fa-solid fa-circle-check', 'Success', 'Password saved as text');
        } catch (err) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Unable to save file');
        }

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'password.txt';
        downloadLink.click();
    }

    function createToast(type, icon, title, text) {
        let newToast = document.createElement('div');
        newToast.innerHTML = `
            <div class="toast ${type}">
                <i class="${icon}"></i>
                <div class="content">
                    <div class="title">${title}</div>
                    <span>${text}</span>
                </div>
                <i style="cursor:pointer" class="fa-solid fa-xmark" onclick="(this.parentElement).remove()"></i>
            </div>`;
        notifications.appendChild(newToast);
        newToast.timeOut = setTimeout(() => newToast.remove(), 5000);
    }

    document.addEventListener('contextmenu', event => event.preventDefault());
});
