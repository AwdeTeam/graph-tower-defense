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
