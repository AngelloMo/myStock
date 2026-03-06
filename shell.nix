# shell.nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    (pkgs.python3.withPackages (ps: [
      ps.pandas # Keep pandas as it's useful for data manipulation, even if not strictly needed for this CSV parsing
      ps.pip # Keep pip, might be useful for other things later
      ps.requests # Add requests for fetching CSVs
    ]))
  ];

  shellHook = ''
    echo "Python environment ready."
  '';
}