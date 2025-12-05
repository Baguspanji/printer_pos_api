{
  "targets": [
    {
      "target_name": "winrawprinter",
      "sources": ["src/winrawprinter.cc"],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "conditions": [
        ["OS=='win'", {
          "msbuild_toolset": "v143"
        }],
        ["OS=='mac'", {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
          }
        }]
      ]
    }
  ]
}
