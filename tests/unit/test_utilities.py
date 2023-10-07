import datetime
from utilities import date_to_iso_date


def test_datetime_to_iso_date():
    today = datetime.date(year=2023, month=5, day=1)

    assert date_to_iso_date(today) == "2023-05-01"
