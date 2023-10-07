from datetime import date

from flask import Blueprint, render_template

from utilities import DataType, get_data

views = Blueprint('views', __name__)

@views.route('/') #home page 
def home():
    return render_template("home.html")

@views.route('/earth')
def earth():
    start_date = date(year=2000, month=1, day=1)

    end_date = date.today()
    data_type = DataType.FIREBALL

    df = get_data(start_date, end_date, data_type)

    data_json = df.to_json(orient='records')

    return render_template("earth.html", data=data_json, headings=df.columns.values)


@views.route('/mars')
def mars():
    return render_template("mars.html")


@views.route('/sun')
def sun():
    start_date = date(year=2000, month=1, day=1)

    end_date = date.today()
    data_type = DataType.FIREBALL

    df = get_data(start_date, end_date, data_type)

    data_json = df.to_json(orient='records')

    return render_template("sun.html", data=data_json, headings=df.columns.values)

