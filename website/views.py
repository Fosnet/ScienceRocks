from flask import Blueprint, render_template

views = Blueprint('views', __name__)

@views.route('/') #home page 
def home():
    return render_template("home.html")

@views.route('/earth')
def earth(): 
    return "<h1>earth page</h1>"

@views.route('/mars')
def mars():
    return "<h1>mars page</h1>"

