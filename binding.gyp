{
  "targets": [
    {
      "target_name": "winrawprinter",
      "sources": [],
      "conditions": [
        ["OS=='win'", {
          "sources": [
            "src/winrawprinter.cc"
          ],
          "include_dirs": [
            "<!(node -e \"require('nan')\")"
          ],
          "msbuild_toolset": "v143"
        }]
      ]
    }
  ]
}
