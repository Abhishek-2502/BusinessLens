from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 5000

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Send response status
        self.send_response(200)
        # Send headers
        self.send_header("Content-type", "text/html")
        self.end_headers()
        # Response content
        self.wfile.write(b"<html><body><h1>Server is running!</h1></body></html>")

# Bind to all interfaces so public IP can access
httpd = HTTPServer(("0.0.0.0", PORT), SimpleHandler)
print(f"Serving on port {PORT}... Access via http://<PUBLIC_IP>:{PORT}")
httpd.serve_forever()


#python3 port_check.py