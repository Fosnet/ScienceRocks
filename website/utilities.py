import requests
from datetime import date
import pandas as pd

from enum import Enum


class NasaDataObject:
    def __init__(self):
        self.location = None
        self.base_url = None
        self.data = pd.DataFrame(columns=['date', 'latitude', 'longitude', 'notes'])
        self.start_date_text = "startDate"
        self.end_date_text = "endDate"

    def read_data(self, *args, **kwargs):
        print('Not implemented')


class FireballData(NasaDataObject):
    def __init__(self):
        super().__init__()
        self.base_url = "https://ssd-api.jpl.nasa.gov/fireball.api?"
        self.start_date_text = "date-min"
        self.end_date_text = "date-max"
        self.notes = None

    def read_data(self, raw_data):
        """
        Reads fireball data in this format: https://ssd-api.jpl.nasa.gov/doc/fireball.html. Returns the following:
          - latitude
          - longitude
          - altitude (m)
          - velocity (m/s)
          - radiated-energy (10^10 J)
          - impact energy (kt)
        """
        headings = raw_data['fields']
        data = raw_data['data']

        df = pd.DataFrame(data, columns=headings)
        df['lat'] = pd.to_numeric(df['lat'])
        df['lon'] = pd.to_numeric(df['lon'])
        df['alt'] = pd.to_numeric(df['alt'])
        df['vel'] = pd.to_numeric(df['vel'])
        df['radiated-energy'] = pd.to_numeric(df['energy'])
        df['impact-energy'] = pd.to_numeric(df['impact-e'])
        df['date'] = pd.to_datetime(df['date'])

        df['latitude'] = df.apply(lambda row: row['lat'] if row['lat-dir'] == 'N' else -row['lat'], axis=1)
        df['longitude'] = df.apply(lambda row: row['lon'] if row['lon-dir'] == 'E' else -row['lon'], axis=1)
        df['altitude'] = df['alt'] * 1000
        df['velocity'] = df['vel'] * 1000
        df['notes'] = 'Altitude: ' + df['altitude'].astype(str) + 'm, Velocity: ' + df['velocity'].astype(str) + 'm/s, Radiated energy: ' + df['radiated-energy'].astype(str) + '10^10J, Impact energy: ' + df['radiated-energy'].astype(str) + 'kt'

        self.data = df[['date', 'latitude', 'longitude', 'altitude', 'velocity', 'radiated-energy', 'impact-energy', 'notes']]
        return self.data


class CoronalMassEjection(NasaDataObject):
    def __init__(self):
        super().__init__()
        self.base_url = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CMEAnalysis?"
        self.notes = None

    def read_data(self, raw_data):
        """
        Reads solar flare data in this format: https://ccmc.gsfc.nasa.gov/tools/DONKI/#coronal-mass-ejection--cme-. Returns the following:
          - latitude
          - longitude
          - half-angle
          - speed
        """
        df = pd.DataFrame(raw_data)
        df = df.rename(columns={"halfAngle": "half-angle", "time21_5": 'date'})
        df['date'] = pd.to_datetime(df['date'])

        df['notes'] = 'Speed: ' + df['speed'].astype(str) + 'm/s, Half angle: ' + df['half-angle'].astype(str) + ', Other information: ' + df['note'].astype(str)

        self.data = df[['date', 'latitude', 'longitude', 'speed', 'half-angle', 'notes']]
        return self.data


class DataType(Enum):
    # GEOMAGNETIC_STORM = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/GST?"
    # SOLAR_FLARE = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?"
    CORONAL_MASS_EJECTION = CoronalMassEjection()
    FIREBALL = FireballData()


def date_to_iso_date(date):
    return date.isoformat()


def get_data(start_date: date, end_date: date, data_type_object: DataType):

    start_date = date_to_iso_date(start_date)
    end_date = date_to_iso_date(end_date)

    data_type = data_type_object.value

    response = requests.get(f"{data_type.base_url}{data_type.start_date_text}={start_date}&{data_type.end_date_text}={end_date}")

    if response.ok:
        raw_data = response.json()

        return data_type.read_data(raw_data)

    else:
        print("Unable to retrieve data")


if __name__ == '__main__':
    start_date = date(year=2023, month=10, day=1)
    end_date = date.today()
    data_type = DataType.CORONAL_MASS_EJECTION

    data = get_data(start_date, end_date, data_type)

    print(data)
