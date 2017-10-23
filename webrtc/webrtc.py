from flask import Flask
from flask import render_template
import ssl

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('sipml.html')


if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(host='0.0.0.0', port=5000, ssl_context='adhoc', threaded=True, debug=True)

