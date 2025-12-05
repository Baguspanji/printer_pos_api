#include <nan.h>
#include <windows.h>
#include <winspool.h>
#include <stdio.h>

#pragma comment(lib, "winspool.lib")
#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "oleaut32.lib")

// Function to send data to raw printer
NAN_METHOD(SendToPrinter) {
    if (info.Length() < 2) {
        return Nan::ThrowTypeError("Wrong number of arguments");
    }

    if (!info[0]->IsString() || !info[1]->IsString()) {
        return Nan::ThrowTypeError("Arguments must be strings");
    }

    v8::String::Utf8Value printerName(info.GetIsolate(), info[0]);
    v8::String::Utf8Value data(info.GetIsolate(), info[1]);

    // Convert to wide characters for Windows API
    int len = MultiByteToWideChar(CP_UTF8, 0, *printerName, -1, NULL, 0);
    wchar_t* wPrinterName = new wchar_t[len];
    MultiByteToWideChar(CP_UTF8, 0, *printerName, -1, wPrinterName, len);

    HANDLE hPrinter;
    if (!OpenPrinterW(wPrinterName, &hPrinter, NULL)) {
        delete[] wPrinterName;
        return Nan::ThrowError("Failed to open printer");
    }

    // Send data to printer
    DWORD dwBytesWritten = 0;
    DWORD dwBytesToWrite = strlen(*data);

    if (!WritePrinter(hPrinter, (LPVOID)*data, dwBytesToWrite, &dwBytesWritten)) {
        ClosePrinter(hPrinter);
        delete[] wPrinterName;
        return Nan::ThrowError("Failed to write to printer");
    }

    ClosePrinter(hPrinter);
    delete[] wPrinterName;

    info.GetReturnValue().Set(Nan::New<v8::Number>(dwBytesWritten));
}

// Function to list available printers
NAN_METHOD(GetPrinters) {
    v8::Isolate* isolate = info.GetIsolate();
    v8::Local<v8::Array> printerArray = Nan::New<v8::Array>();
    int index = 0;

    PRINTER_INFO_4W* pPrinterEnum = NULL;
    DWORD cbBuf = 0;
    DWORD cPrinters = 0;

    EnumPrintersW(PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS, NULL, 4, NULL, 0, &cbBuf, &cPrinters);
    
    if (cbBuf > 0) {
        pPrinterEnum = (PRINTER_INFO_4W*)malloc(cbBuf);
        if (EnumPrintersW(PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS, NULL, 4, (LPBYTE)pPrinterEnum, cbBuf, &cbBuf, &cPrinters)) {
            for (DWORD i = 0; i < cPrinters; i++) {
                int nameLen = WideCharToMultiByte(CP_UTF8, 0, pPrinterEnum[i].pPrinterName, -1, NULL, 0, NULL, NULL);
                char* printerName = new char[nameLen];
                WideCharToMultiByte(CP_UTF8, 0, pPrinterEnum[i].pPrinterName, -1, printerName, nameLen, NULL, NULL);

                Nan::Set(printerArray, index++, Nan::New<v8::String>(printerName).ToLocalChecked());
                delete[] printerName;
            }
        }
        free(pPrinterEnum);
    }

    info.GetReturnValue().Set(printerArray);
}

// Module initialization
NAN_MODULE_INIT(Init) {
    Nan::Set(target, Nan::New<v8::String>("sendToPrinter").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SendToPrinter)).ToLocalChecked());
    
    Nan::Set(target, Nan::New<v8::String>("getPrinters").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(GetPrinters)).ToLocalChecked());
}

NODE_MODULE(winrawprinter, Init)
