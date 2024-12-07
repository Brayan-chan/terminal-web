const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // Para servir archivos estáticos

let currentDirectory = process.cwd(); // Directorio actual inicial

app.post('/execute', (req, res) => {
    const commandInput = req.body.command;
    const [command, ...args] = commandInput.split(' ');

    // Manejo del comando 'cd'
    if (command === 'cd') {
        const newDir = args[0];
        const newPath = path.resolve(currentDirectory, newDir);
        try {
            process.chdir(newPath); // Cambia el directorio del proceso
            currentDirectory = process.cwd(); // Actualiza el directorio actual
            return res.json({ output: `Cambiado a ${currentDirectory}` });
        } catch (err) {
            return res.status(400).json({ output: `Error: ${err.message}` });
        }
    }

    // Manejo del comando 'mkdir' para crear directorios
    if (command === 'mkdir') {
        const newDir = args[0];
        const newPath = path.join(currentDirectory, newDir);
        fs.mkdir(newPath, { recursive: true }, (err) => {
            if (err) {
                return res.status(500).json({ output: `Error: ${err.message}` });
            }
            return res.json({ output: `Directorio creado: ${newPath}` });
        });
        return; // Salir de la función
    }

    // Manejo del comando 'code' para abrir Visual Studio Code
    if (command === 'code') {
        const fullCommand = `code ${args.join(' ')}`; // Abre VS Code en el directorio actual
        exec(fullCommand, { cwd: currentDirectory }, (stdout, stderr) => {
            if (stderr) {
                return res.status(500).json({ output: stderr });
            }
            res.json({ output: stdout });
        });
        return; // Salir de la función
    }

    if (command === 'ls') {
        fs.readdir(currentDirectory, (err, files) => {
            if (err) {
                return res.status(500).json({ output: `Error: ${err.message}` });
            }
            return res.json({ output: files.join('\n') });
        });
        return; // Salir de la función
    }

    if (command === 'pwd') {
        return res.json({ output: currentDirectory });
    }

    if (command === 'cat') {
        const filePath = path.join(currentDirectory, args[0]);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ output: `Error: ${err.message}` });
            }
            res.json({ output: data });
        });
        return; // Salir de la función
    }

    if (command === 'rm') {
        const filePath = path.join(currentDirectory, args[0]);
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ output: `Error: ${err.message}` });
            }
            return res.json({ output: `Archivo eliminado: ${filePath}` });
        });
        return; // Salir de la función
    }

    if (command === 'mv') {
        const oldPath = path.join(currentDirectory, args[0]);
        const newPath = path.join(currentDirectory, args[1]);
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                return res.status(500).json({ output: `Error: ${err.message}` });
            }
            return res.json({ output: `Archivo renombrado: ${oldPath} a ${newPath}` });
        });
        return; // Salir de la función
    }

    if (command === 'cp') {
        const oldPath = path.join(currentDirectory, args[0]);
        const newPath = path.join(currentDirectory, args[1]);
        fs.copyFile(oldPath, newPath, (err) => {
            if (err) {
                return res.status(500).json({ output: `Error: ${err.message}` });
            }
            return res.json({ output: `Archivo copiado: ${oldPath} a ${newPath}` });
        });
        return; // Salir de la función
    }

    if (command === 'touch') {
        const filePath = path.join(currentDirectory, args[0]);
        fs.writeFile(filePath, '', (err) => {
            if (err) {
                return res.status(500).json({ output: `Error: ${err.message}` });
            }
            return res.json({ output: `Archivo creado: ${filePath}` });
        });
        return; // Salir de la función
    }

    // Ejecuta otros comandos
    exec(commandInput, { cwd: currentDirectory }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ output: stderr || error.message });
        }
        res.json({ output: stdout });
    });
});

app.get('/commands', (req, res) => {
  
    const availableCommands = [
        'help', 'clear', 'echo', 'cd', 'mkdir', 'code .', 'ls', 'pwd', 'cat', 'rm', 'mv', 'cp', 'touch'];
    res.json(availableCommands);
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});