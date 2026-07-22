/**
 * nasa.wesleykamau.com — NASA Book of Faces.
 * Copy this file over next/signature.config.js in the Book of Faces repo.
 * Colors/font match the Book of Faces variant on wesleykamau.com, so the
 * exit-close there and the arrival intro here are the same look.
 * (nasa.wesleykamau.com is a subdomain, so "wesleykamau.com" in `domains`
 * already covers it on both sides.)
 */
export const SIGNATURE_CONFIG = {
  name: "Book of Faces",
  paper: "#141a3d",
  ink: "#cdd7ff",
  font: "'wks-mark', 'Geist', system-ui, sans-serif",
  fonts: { "Book of Faces": { family: "wks-mark", weight: 700 } },
  reveal: "up",
  minHold: 1875,
  domains: ["wesleykamau.com", "wesleygram.com"],
};
