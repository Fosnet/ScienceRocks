from flask import Blueprint, render_template

views = Blueprint('views', __name__)

@views.route('/') #home page 
def home():
    return render_template("home.html")

@views.route('/earth')
def earth(): 
    return render_template("earth.html")

@views.route('/mars')
def mars():
    return render_template("mars.html")

