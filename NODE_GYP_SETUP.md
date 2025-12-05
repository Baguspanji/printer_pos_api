# Node-Gyp Setup for winrawprinter

This guide explains how to build and use the native winrawprinter module on Windows.

## Prerequisites

### Windows Build Tools

You need the following to compile native modules on Windows:

1. **Python 3.x** - Required by node-gyp
2. **Visual Studio Build Tools** - C++ compiler and SDK
3. **windows-build-tools** (npm package) - Automates the setup

### Installation Steps

#### Option 1: Automatic Setup (Recommended)

Run the following command as Administrator:

```bash
npm install --save-dev windows-build-tools
```

This will:
- Install Python (if not present)
- Install Visual Studio Build Tools
- Configure node-gyp automatically

#### Option 2: Manual Setup

1. Install Python 3.x from https://www.python.org/downloads/
   - Add Python to PATH during installation

2. Install Visual Studio Build Tools from https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Select "Desktop development with C++" workload
   - Select "MSVC v143" or later
   - Select "Windows 10/11 SDK"

3. Install node-gyp globally (optional):
```bash
npm install -g node-gyp
```

## Building the Native Module

After prerequisites are installed:

```bash
# Install dependencies
npm install

# Build the native module
npm run build-native

# Clean build files (if needed)
npm run build-native-clean
```

The compiled binary will be located at: `build/Release/winrawprinter.node`

## Using the Module

```javascript
const winrawprinter = require('./utils/winrawprinter');

// Get list of available printers
const printers = winrawprinter.getPrinters();
console.log('Available printers:', printers);

// Send data to a printer
try {
    const printerName = 'Your Printer Name';
    const data = 'ESC/POS commands here';
    const bytesWritten = winrawprinter.sendToPrinter(printerName, data);
    console.log(`Sent ${bytesWritten} bytes to printer`);
} catch (error) {
    console.error('Error printing:', error.message);
}
```

## Troubleshooting

### "gyp ERR! configure error"
- Make sure Python is installed and in PATH
- Run: `npm config set python /path/to/python.exe`

### "MSBuild.exe not found"
- Install Visual Studio Build Tools with C++ workload
- Or run: `npm install --save-dev windows-build-tools`

### "Cannot find module 'winrawprinter'"
- Make sure you've run `npm run build-native`
- Check that `build/Release/winrawprinter.node` exists
- Verify you're on Windows (module only works on Windows)

### Module not loaded in production
- Build on the same Windows version as the target machine
- Ensure Node.js architecture (x64/x86) matches

## Integration with Existing Code

The module is already integrated in `utils/printer.js`. Update it to use winrawprinter:

```javascript
const winrawprinter = require('./winrawprinter');

// Use in your printer communication code
if (winrawprinter.isAvailable()) {
    try {
        winrawprinter.sendToPrinter(printerName, escposData);
    } catch (error) {
        console.error('Raw printer error:', error);
    }
}
```

## Performance Notes

- This module provides low-level, direct printer access
- Useful for thermal POS printers that require raw ESC/POS commands
- Bypass Windows print spooler for faster printing
- Best used for receipt printing on dedicated printers

## Further Reading

- [node-gyp Documentation](https://github.com/nodejs/node-gyp)
- [Windows Print Spooler API](https://docs.microsoft.com/en-us/windows/win32/printdocs/print-spooler-api)
- [ESC/POS Commands](https://www.possdever.com/esc-pos-command.html)
