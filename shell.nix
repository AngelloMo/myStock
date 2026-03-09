# shell.nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    (pkgs.python3.withPackages (ps: [
      ps.pandas
      ps.pip
      ps.requests
      ps.yfinance
    ]))
  ];

  shellHook = ''
    echo "Python environment ready."
  '';
}