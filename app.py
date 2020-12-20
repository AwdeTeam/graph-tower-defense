"""
app
====================================================================================================

Flask simple static server

----------------------------------------------------------------------------------------------------

**Created**
    2020-12-18
**Author**
    Darkar
"""

from flask import Flask, send_from_directory

app = Flask(__name__,
            static_url_path="/static",
            static_folder="build",
            )


@app.route("/")
def serve():
    return send_from_directory("", "index.html")


# (nope, I'm just blind and didn't see we have to prefix routes with /static)
#  @app.route("/assets/<path:path>")
#  def send_assets(path):
#      return send_from_directory("build/assets", path)
