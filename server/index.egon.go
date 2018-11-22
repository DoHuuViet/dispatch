// Generated by egon.
// 🚫Edit at your own risk.

package server
import (
"io"
)

func IndexTemplate(w io.Writer, cssPath string, inlineScript string, scripts []string) error {
io.WriteString(w, "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><meta name=\"theme-color\" content=\"#f0f0f0\"><title>Dispatch</title><meta name=\"description\" content=\"Web-based IRC client.\"><link rel=\"preload\" href=\"/init\" as=\"fetch\" crossorigin><script>")
io.WriteString(w,  inlineScript )
io.WriteString(w, "</script><link rel=\"preload\" href=\"/font/fontello.woff2?48901973\" as=\"font\" type=\"font/woff2\" crossorigin><link rel=\"preload\" href=\"/font/RobotoMono-Regular.woff2\" as=\"font\" type=\"font/woff2\" crossorigin><link rel=\"preload\" href=\"/font/Montserrat-Regular.woff2\" as=\"font\" type=\"font/woff2\" crossorigin><link rel=\"preload\" href=\"/font/Montserrat-Bold.woff2\" as=\"font\" type=\"font/woff2\" crossorigin><link rel=\"preload\" href=\"/font/RobotoMono-Bold.woff2\" as=\"font\" type=\"font/woff2\" crossorigin>")
 if cssPath != "" { 
io.WriteString(w, "<link href=\"/")
io.WriteString(w,  cssPath )
io.WriteString(w, "\" rel=\"stylesheet\">")
 } 
io.WriteString(w, "<link rel=\"manifest\" href=\"/manifest.json\"></head><body><div id=\"root\"></div>")
 for _, script := range scripts { 
io.WriteString(w, "<script src=\"/")
io.WriteString(w,  script )
io.WriteString(w, "\"></script>")
 } 
io.WriteString(w, "<noscript>This page needs JavaScript enabled to function.</noscript></body></html>")
return nil
}
