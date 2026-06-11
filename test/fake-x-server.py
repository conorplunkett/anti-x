import http.server, ssl, re

TWEET = '''<div data-testid="cellInnerDiv"><article data-testid="tweet"><div>{sc}<div dir="ltr"><span>{text}</span></div></div></article></div>'''

def tweets(n, suggested_at=None):
    out = []
    for i in range(n):
        sc = '<div data-testid="socialContext"><span>Suggested for you</span></div>' if i == suggested_at else ''
        out.append(TWEET.format(sc=sc, text=f"Tweet number {i} — some content here."))
    return "".join(out)

SIDEBAR = '''
<div data-testid="sidebarColumn">
  <div aria-label="Timeline: Trending now">
    <h2>What’s happening</h2>
    <div data-testid="trend"><span>#Trend1</span></div>
    <div data-testid="trend"><span>#Trend2</span></div>
  </div>
  <aside aria-label="Who to follow">
    <h2>Who to follow</h2>
    <div data-testid="UserCell"><span>@someone</span></div>
    <div data-testid="UserCell"><span>@another</span></div>
  </aside>
</div>'''

NAV = '''
<header><nav>
  <a data-testid="AppTabBar_Home_Link" href="/home">Home</a>
  <a data-testid="AppTabBar_Explore_Link" href="/explore">Explore</a>
  <a data-testid="AppTabBar_Notifications_Link" href="/notifications">Notifications</a>
  <a data-testid="AppTabBar_DirectMessage_New" href="/messages">Messages</a>
</nav></header>'''

def shell(primary):
    return f'''<!doctype html><html><head><title>X</title></head><body>
<div id="react-root"><main role="main">{NAV}
<div data-testid="primaryColumn">{primary}</div>
{SIDEBAR}</main></div></body></html>'''

PAGES = {}
PAGES["/home"] = shell(f'''
  <div role="tablist">
    <div role="tab" aria-selected="true"><span>For you</span></div>
    <div role="tab" aria-selected="false"><span>Following</span></div>
  </div>
  <div aria-label="Home timeline">{tweets(6, suggested_at=2)}</div>''')
PAGES["/explore"] = shell(f'''<div aria-label="Timeline: Explore">{tweets(5)}<div data-testid="trend"><span>#ExploreTrend</span></div></div>''')
PAGES["/messages"] = shell('''<div aria-label="Timeline: Messages"><h1>Messages</h1><div data-testid="cellInnerDiv">A conversation</div></div>''')
PAGES["/notifications"] = shell(f'''<div aria-label="Timeline: Notifications">{tweets(3)}</div>''')
PAGES["/someuser/status/12345"] = shell(f'''
  <div aria-label="Timeline: Conversation">
    {tweets(3)}
    <div data-testid="cellInnerDiv"><h2><span>Discover more</span></h2></div>
    {tweets(4)}
  </div>''')

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?")[0]
        body = PAGES.get(path) or PAGES.get("/home" if path == "/" else None) or "<html><body>404</body></html>"
        data = body.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
    def log_message(self, *a): pass

httpd = http.server.HTTPServer(("127.0.0.1", 443), H)
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.load_cert_chain("/tmp/fake-x/cert.pem", "/tmp/fake-x/key.pem")
httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)
print("serving", flush=True)
httpd.serve_forever()
