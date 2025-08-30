from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    port = 8000
    os.chdir('.')  # Serve from current directory
    
    print(f"Starting server at http://localhost:{port}")
    print(f"Serving files from: {os.getcwd()}")
    print("\nAvailable files:")
    for file in os.listdir('.'):
        if file.endswith('.html'):
            print(f"  http://localhost:{port}/{file}")
    
    httpd = HTTPServer(('localhost', port), CORSRequestHandler)
    httpd.serve_forever()